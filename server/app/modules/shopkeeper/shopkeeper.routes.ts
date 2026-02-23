import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth, requireRole } from "../../common/middleware/auth.middleware.js";
import { sendResponse } from "../../common/utils/response.js";
import { productStore } from "../product/product.store.js";

export const shopkeeperRouter = Router();

shopkeeperRouter.get(
  "/dashboard",
  requireAuth,
  requireRole("shopkeeper"),
  async (req: Request, res: Response) => {
    const products = await productStore.list({ page: 1, limit: 1 });
    sendResponse(res, 200, "Shopkeeper dashboard", {
      userId: req.user?.id,
      role: req.user?.role,
      totalProducts: products.pagination.total,
      summary: "Inventory and sales management"
    });
  }
);
