import type { Request, Response } from "express";
import { AppError } from "../../common/middlewares/error.middleware.js";
import { sendResponse } from "../../common/utils/response.js";
import { productService } from "./product.service.js";

export const productController = {
  async list(req: Request, res: Response): Promise<void> {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 9)));
    const minPrice =
      req.query.minPrice !== undefined ? Number(req.query.minPrice) : undefined;
    const maxPrice =
      req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : undefined;
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : undefined;
    const category =
      typeof req.query.category === "string"
        ? req.query.category.trim()
        : undefined;
    const lng = req.query.lng ? Number(req.query.lng) : undefined;
    const lat = req.query.lat ? Number(req.query.lat) : undefined;

    const data = await productService.list({
      page,
      limit,
      ...(minPrice !== undefined ? { minPrice } : {}),
      ...(maxPrice !== undefined ? { maxPrice } : {}),
      ...(search !== undefined ? { search } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(lng !== undefined ? { lng } : {}),
      ...(lat !== undefined ? { lat } : {}),
    });

    sendResponse(res, 200, "Products fetched", data);
  },

  async getById(req: Request, res: Response): Promise<void> {
    const productId = req.params.id;
    if (!productId) {
      throw new AppError("Product id is required", 400);
    }

    const product = await productService.getById(productId);

    sendResponse(res, 200, "Product fetched", product);
  },

  async listMine(req: Request, res: Response): Promise<void> {
    const shopkeeperId = req.user?.id;
    if (!shopkeeperId) {
      throw new AppError("Unauthorized", 401);
    }

    const products = await productService.listMine(shopkeeperId);

    sendResponse(res, 200, "My products fetched", products);
  },

  async create(req: Request, res: Response): Promise<void> {
    const shopkeeperId = req.user?.id;
    if (!shopkeeperId) {
      throw new AppError("Unauthorized", 401);
    }

    const product = await productService.create(shopkeeperId, req.body);
    sendResponse(res, 201, "Product created", product);
  },

  async update(req: Request, res: Response): Promise<void> {
    const shopkeeperId = req.user?.id;
    if (!shopkeeperId) {
      throw new AppError("Unauthorized", 401);
    }

    const productId = req.params.id;
    if (!productId) {
      throw new AppError("Product id is required", 400);
    }

    const product = await productService.update(
      shopkeeperId,
      productId,
      req.body,
    );

    sendResponse(res, 200, "Product updated", product);
  },

  async remove(req: Request, res: Response): Promise<void> {
    const shopkeeperId = req.user?.id;
    if (!shopkeeperId) {
      throw new AppError("Unauthorized", 401);
    }

    const productId = req.params.id;
    if (!productId) {
      throw new AppError("Product id is required", 400);
    }

    await productService.remove(shopkeeperId, productId);

    sendResponse(res, 200, "Product removed", null);
  },
};
