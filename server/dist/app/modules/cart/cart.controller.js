import { AppError } from "../../common/middleware/error.middleware.js";
import { sendResponse } from "../../common/utils/response.js";
import { productStore } from "../product/product.store.js";
import { cartStore } from "./cart.store.js";
export const cartController = {
    async getCart(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }
        const cartItems = await cartStore.getByUserId(userId);
        const items = await Promise.all(cartItems.map(async (item) => {
            const product = await productStore.findById(item.productId);
            return {
                ...item,
                product
            };
        }));
        sendResponse(res, 200, "Cart fetched", items);
    },
    async upsertItem(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }
        const { productId, quantity } = req.body;
        const product = await productStore.findById(productId);
        if (!product) {
            throw new AppError("Product not found", 404);
        }
        if (quantity > product.stock) {
            throw new AppError("Quantity exceeds stock", 400);
        }
        const currentItems = await cartStore.getByUserId(userId);
        const index = currentItems.findIndex((item) => item.productId === productId);
        const nextItems = [...currentItems];
        if (index >= 0) {
            nextItems[index] = { productId, quantity };
        }
        else {
            nextItems.push({ productId, quantity });
        }
        await cartStore.setByUserId(userId, nextItems);
        sendResponse(res, 200, "Cart updated", nextItems);
    },
    async removeItem(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }
        const nextItems = (await cartStore.getByUserId(userId))
            .filter((item) => item.productId !== req.params.productId);
        await cartStore.setByUserId(userId, nextItems);
        sendResponse(res, 200, "Cart item removed", nextItems);
    }
};
