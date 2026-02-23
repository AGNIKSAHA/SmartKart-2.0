import type { Request, Response } from "express";
import { AppError } from "../../common/middlewares/error.middleware.js";
import { sendResponse } from "../../common/utils/response.js";
import { paymentService } from "./payment.service.js";

export const paymentController = {
  async createCheckoutSession(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const payload = req.body as {
      shippingDetails: {
        recipientName: string;
        address: string;
        mobileNumber: string;
        alternateNumber?: string;
      };
    };

    const sessionData = await paymentService.createCheckoutSession(
      userId,
      payload.shippingDetails,
    );

    sendResponse(res, 200, "Checkout session created", sessionData);
  },

  async handleWebhook(req: Request, res: Response): Promise<void> {
    const signature = req.headers["stripe-signature"];
    if (!signature || typeof signature !== "string") {
      throw new AppError("Missing Stripe signature", 400);
    }

    await paymentService.handleWebhook(req.body as Buffer, signature);

    res.status(200).json({ received: true });
  },

  async getSessionStatus(req: Request, res: Response): Promise<void> {
    const sessionId = req.query.session_id;
    if (!sessionId || typeof sessionId !== "string") {
      throw new AppError("session_id query parameter is required", 400);
    }

    const statusObj = await paymentService.getSessionStatus(sessionId);

    sendResponse(res, 200, "Session status retrieved", statusObj);
  },

  async cancelPaidOrder(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const orderId = req.params.orderId;
    if (!orderId) {
      throw new AppError("Order id is required", 400);
    }

    const order = await paymentService.cancelPaidOrder(orderId, userId);

    sendResponse(res, 200, "Order cancelled and refund initiated", order);
  },
};
