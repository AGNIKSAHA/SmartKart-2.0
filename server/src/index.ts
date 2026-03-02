import "./app/common/types/express.types.js";
import "express-async-errors";

import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import express from "express";
import { connectToDatabase } from "./app/common/config/database.js";
import { env } from "./app/common/config/env.js";
import {
  errorHandler,
  notFoundHandler,
} from "./app/common/middlewares/error.middleware.js";
import { apiLimiter } from "./app/common/middlewares/rateLimit.middleware.js";
import router from "./app/routes.js";
import { productStore } from "./app/modules/product/product.store.js";

const app = express();

// Trust the first proxy hop (Render's load balancer / any reverse proxy).
// Required for express-rate-limit to correctly read X-Forwarded-For and
// identify real client IPs instead of throwing ERR_ERL_UNEXPECTED_X_FORWARDED_FOR.
app.set("trust proxy", 1);

// Security headers — set before any route handlers.
// crossOriginOpenerPolicy: "same-origin-allow-popups" is required for the
// Google OAuth popup to postMessage credentials back to the opener window.
// Without it (or with the stricter "same-origin" default), the popup is
// silently severed and Google Sign-In fails with an AbortError / COOP warning.
app.use(
  helmet({
    crossOriginOpenerPolicy: {
      policy: "same-origin-allow-popups",
    },
    crossOriginEmbedderPolicy: false,
  }),
);
// CORS — accept comma-separated list of origins from env so both local dev
// and multiple production domains are supported without code changes.
const allowedOrigins = env.CORS_ORIGIN.split(",").map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, same-origin server calls)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Pass null + false: correctly omits Access-Control-Allow-Origin header
      // (standard CORS rejection). Do NOT throw an Error here — that would
      // bypass the cors library and hit the global error handler as a 500.
      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(null, false);
    },
    credentials: true,
  }),
);

// Stripe webhook needs raw body – mount before express.json()
app.use("/api/v1/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(cookieParser());

// Apply global API rate limit
app.use("/api", apiLimiter);

// Health Check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "ecommercex-backend" });
});

// API Routes
app.use("/api/v1", router);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

const bootstrap = async (): Promise<void> => {
  await connectToDatabase();
  await productStore.ensureSeed();

  app.listen(env.PORT, () => {
    const startedAt = new Date().toISOString();
    console.log(
      `[${startedAt}] Server running on http://localhost:${env.PORT}`,
    );
  });
};

void bootstrap().catch((error: unknown) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
