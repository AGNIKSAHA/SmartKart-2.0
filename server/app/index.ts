import "./common/types/express.types.js";
import "express-async-errors";

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { connectToDatabase } from "./common/config/database.js";
import { env } from "./common/config/env.js";
import {
  errorHandler,
  notFoundHandler,
} from "./common/middleware/error.middleware.js";
import {
  apiLimiter,
  authLimiter,
} from "./common/middleware/rateLimit.middleware.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { cartRouter } from "./modules/cart/cart.routes.js";
import { consumerRouter } from "./modules/consumer/consumer.routes.js";
import { orderRouter } from "./modules/order/order.routes.js";
import { notificationRouter } from "./modules/notification/notification.routes.js";
import { paymentRouter } from "./modules/payment/payment.routes.js";
import { productRouter } from "./modules/product/product.routes.js";
import { profileRouter } from "./modules/profile/profile.routes.js";
import { shopkeeperRouter } from "./modules/shopkeeper/shopkeeper.routes.js";
import { userRouter } from "./modules/user/user.routes.js";
import { productStore } from "./modules/product/product.store.js";

const app = express();

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

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "ecommercex-backend" });
});

app.use("/api/v1/auth", authLimiter, authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/consumer", consumerRouter);
app.use("/api/v1/shopkeeper", shopkeeperRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/profile", profileRouter);

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
