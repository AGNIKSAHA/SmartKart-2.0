import { AppError } from "../../common/middlewares/error.middleware.js";
import { productStore } from "../product/product.store.js";
import { cartStore } from "./cart.store.js";

export const cartService = {
  async getCart(userId: string) {
    const cartItems = await cartStore.getByUserId(userId);
    const items = await Promise.all(
      cartItems.map(async (item) => {
        const product = await productStore.findById(item.productId);
        return {
          ...item,
          product,
        };
      }),
    );
    return items;
  },

  async upsertItem(userId: string, productId: string, quantity: number) {
    const product = await productStore.findById(productId);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    if (quantity > product.stock) {
      throw new AppError("Quantity exceeds stock", 400);
    }

    const currentItems = await cartStore.getByUserId(userId);
    const index = currentItems.findIndex(
      (item) => item.productId === productId,
    );

    const nextItems = [...currentItems];
    if (index >= 0) {
      nextItems[index] = { productId, quantity };
    } else {
      nextItems.push({ productId, quantity });
    }

    await cartStore.setByUserId(userId, nextItems);
    return nextItems;
  },

  async removeItem(userId: string, productId: string) {
    const nextItems = (await cartStore.getByUserId(userId)).filter(
      (item) => item.productId !== productId,
    );
    await cartStore.setByUserId(userId, nextItems);
    return nextItems;
  },
};
