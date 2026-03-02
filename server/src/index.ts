import "./app/common/types/express.types.js";
import "express-async-errors";

import cookieParser from "cookie-parser";
import cors from "cors";
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

// Middlewares
app.use(
  cors({
    origin: env.CORS_ORIGIN,
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
