import type { Request, Response } from "express";
import { AppError } from "../../common/middlewares/error.middleware.js";
import { sendResponse } from "../../common/utils/response.js";
import { cartService } from "./cart.service.js";

export const cartController = {
  async getCart(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const items = await cartService.getCart(userId);
    sendResponse(res, 200, "Cart fetched", items);
  },

  async upsertItem(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const { productId, quantity } = req.body as {
      productId: string;
      quantity: number;
    };
    const nextItems = await cartService.upsertItem(userId, productId, quantity);
    sendResponse(res, 200, "Cart updated", nextItems);
  },

  async removeItem(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const productId = req.params.productId;
    if (!productId) {
      throw new AppError("Product ID is required", 400);
    }
    const nextItems = await cartService.removeItem(userId, productId);
    sendResponse(res, 200, "Cart item removed", nextItems);
  },
};
