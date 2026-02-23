import { AppError } from "../../common/middlewares/error.middleware.js";
import { productStore } from "./product.store.js";
import type { ProductEntity } from "../../common/types/domain.types.js";
import { userStore } from "../user/user.store.js";

const assertShopkeeperProfileComplete = async (
  shopkeeperId: string,
): Promise<void> => {
  const user = await userStore.findById(shopkeeperId);
  if (!user || user.role !== "shopkeeper") {
    throw new AppError("Unauthorized", 401);
  }

  if (!user.shopkeeperProfile) {
    throw new AppError(
      "Complete your shopkeeper profile before managing products",
      400,
    );
  }
};

export const productService = {
  async list(filters: {
    page: number;
    limit: number;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    category?: string;
    lng?: number;
    lat?: number;
  }) {
    if (
      (filters.minPrice !== undefined && Number.isNaN(filters.minPrice)) ||
      (filters.maxPrice !== undefined && Number.isNaN(filters.maxPrice))
    ) {
      throw new AppError("Invalid price filter", 400);
    }
    return productStore.list(filters);
  },

  async getById(productId: string) {
    const product = await productStore.findById(productId);
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    return product;
  },

  async listMine(shopkeeperId: string) {
    const user = await userStore.findById(shopkeeperId);
    if (!user || user.role !== "shopkeeper") {
      throw new AppError("Unauthorized", 401);
    }

    if (!user.shopkeeperProfile) {
      return [];
    }

    return productStore.listByShopkeeperId(shopkeeperId);
  },

  async create(
    shopkeeperId: string,
    payload: Omit<ProductEntity, "id"> & {
      location?: { lng: number; lat: number };
    },
  ) {
    await assertShopkeeperProfileComplete(shopkeeperId);

    const data: Record<string, unknown> = { ...payload };
    if (payload.location) {
      data.location = {
        type: "Point",
        coordinates: [payload.location.lng, payload.location.lat],
      };
    }

    return productStore.create({
      ...(data as unknown as Omit<ProductEntity, "id">),
      shopkeeperId,
    });
  },

  async update(
    shopkeeperId: string,
    productId: string,
    payload: Partial<Omit<ProductEntity, "id">> & {
      location?: { lng: number; lat: number };
    },
  ) {
    await assertShopkeeperProfileComplete(shopkeeperId);

    const data: Record<string, unknown> = { ...payload };
    if (payload.location) {
      data.location = {
        type: "Point",
        coordinates: [payload.location.lng, payload.location.lat],
      };
    }

    const product = await productStore.updateByShopkeeper(
      productId,
      shopkeeperId,
      data as Partial<Omit<ProductEntity, "id">>,
    );
    if (!product) {
      throw new AppError("Product not found or not owned by you", 404);
    }
    return product;
  },

  async remove(shopkeeperId: string, productId: string) {
    await assertShopkeeperProfileComplete(shopkeeperId);

    const removed = await productStore.removeByShopkeeper(
      productId,
      shopkeeperId,
    );
    if (!removed) {
      throw new AppError("Product not found or not owned by you", 404);
    }
    return removed;
  },
};
