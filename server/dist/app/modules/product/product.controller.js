import { AppError } from "../../common/middleware/error.middleware.js";
import { sendResponse } from "../../common/utils/response.js";
import { productStore } from "./product.store.js";
import { userStore } from "../user/user.store.js";
const assertShopkeeperProfileComplete = async (shopkeeperId) => {
    const user = await userStore.findById(shopkeeperId);
    if (!user || user.role !== "shopkeeper") {
        throw new AppError("Unauthorized", 401);
    }
    if (!user.shopkeeperProfile) {
        throw new AppError("Complete your shopkeeper profile before managing products", 400);
    }
};
export const productController = {
    async list(req, res) {
        const page = Math.max(1, Number(req.query.page ?? 1));
        const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 9)));
        const minPrice = req.query.minPrice !== undefined ? Number(req.query.minPrice) : undefined;
        const maxPrice = req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : undefined;
        const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
        const category = typeof req.query.category === "string" ? req.query.category.trim() : undefined;
        if ((minPrice !== undefined && Number.isNaN(minPrice)) || (maxPrice !== undefined && Number.isNaN(maxPrice))) {
            throw new AppError("Invalid price filter", 400);
        }
        sendResponse(res, 200, "Products fetched", await productStore.list({
            page,
            limit,
            ...(minPrice !== undefined ? { minPrice } : {}),
            ...(maxPrice !== undefined ? { maxPrice } : {}),
            ...(search ? { search } : {}),
            ...(category ? { category } : {})
        }));
    },
    async getById(req, res) {
        const productId = req.params.id;
        if (!productId) {
            throw new AppError("Product id is required", 400);
        }
        const product = await productStore.findById(productId);
        if (!product) {
            throw new AppError("Product not found", 404);
        }
        sendResponse(res, 200, "Product fetched", product);
    },
    async listMine(req, res) {
        const shopkeeperId = req.user?.id;
        if (!shopkeeperId) {
            throw new AppError("Unauthorized", 401);
        }
        await assertShopkeeperProfileComplete(shopkeeperId);
        sendResponse(res, 200, "My products fetched", await productStore.listByShopkeeperId(shopkeeperId));
    },
    async create(req, res) {
        const shopkeeperId = req.user?.id;
        if (!shopkeeperId) {
            throw new AppError("Unauthorized", 401);
        }
        await assertShopkeeperProfileComplete(shopkeeperId);
        const product = await productStore.create({ ...req.body, shopkeeperId });
        sendResponse(res, 201, "Product created", product);
    },
    async update(req, res) {
        const shopkeeperId = req.user?.id;
        if (!shopkeeperId) {
            throw new AppError("Unauthorized", 401);
        }
        await assertShopkeeperProfileComplete(shopkeeperId);
        const productId = req.params.id;
        if (!productId) {
            throw new AppError("Product id is required", 400);
        }
        const product = await productStore.updateByShopkeeper(productId, shopkeeperId, req.body);
        if (!product) {
            throw new AppError("Product not found or not owned by you", 404);
        }
        sendResponse(res, 200, "Product updated", product);
    },
    async remove(req, res) {
        const shopkeeperId = req.user?.id;
        if (!shopkeeperId) {
            throw new AppError("Unauthorized", 401);
        }
        await assertShopkeeperProfileComplete(shopkeeperId);
        const productId = req.params.id;
        if (!productId) {
            throw new AppError("Product id is required", 400);
        }
        const removed = await productStore.removeByShopkeeper(productId, shopkeeperId);
        if (!removed) {
            throw new AppError("Product not found or not owned by you", 404);
        }
        sendResponse(res, 200, "Product removed", null);
    }
};
