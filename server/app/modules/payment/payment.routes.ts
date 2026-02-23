import { Router } from "express";
import express from "express";
import {
  requireAuth,
  requireRole,
} from "../../common/middleware/auth.middleware.js";
import { validateBody } from "../../common/middleware/validate.middleware.js";
import { paymentController } from "./payment.controller.js";
import { createOrderSchema } from "../order/order.validation.js";

export const paymentRouter = Router();

// Create a Stripe Checkout Session (authenticated consumer)
paymentRouter.post(
  "/create-checkout-session",
  requireAuth,
  requireRole("consumer"),
  validateBody(createOrderSchema),
  paymentController.createCheckoutSession,
);

// Stripe Webhook (needs raw body, no auth)
paymentRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook,
);

// Verify session status (authenticated)
paymentRouter.get(
  "/session-status",
  requireAuth,
  paymentController.getSessionStatus,
);

// Cancel a paid order (Stripe refund + stock restore)
paymentRouter.patch(
  "/:orderId/cancel",
  requireAuth,
  requireRole("consumer"),
  paymentController.cancelPaidOrder,
);
