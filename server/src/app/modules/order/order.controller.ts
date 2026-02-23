import type { Request, Response } from "express";
import { AppError } from "../../common/middlewares/error.middleware.js";
import { sendResponse } from "../../common/utils/response.js";
import { orderService } from "./order.service.js";

export const orderController = {
  async listMyOrders(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    sendResponse(
      res,
      200,
      "Orders fetched",
      await orderService.listMyOrders(userId),
    );
  },

  async createOrder(req: Request, res: Response): Promise<void> {
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

    const order = await orderService.createOrder(
      userId,
      payload.shippingDetails,
    );

    sendResponse(res, 201, "Order created", order);
  },

  async cancelOrder(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const orderId = req.params.orderId;
    if (!orderId) {
      throw new AppError("Order id is required", 400);
    }

    const order = await orderService.cancelOrder(userId, orderId);

    sendResponse(res, 200, "Order cancelled", order);
  },
};
