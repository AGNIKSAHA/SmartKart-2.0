import { Schema, model } from "mongoose";
const productSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    shopkeeperId: { type: String, required: false, index: true },
}, {
    timestamps: false,
});
const ProductModel = model("Product", productSchema);
const toEntity = (doc) => ({
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    imageUrl: doc.imageUrl,
    price: doc.price,
    stock: doc.stock,
    category: doc.category,
});
const toEntityWithShopkeeper = (doc) => ({
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    imageUrl: doc.imageUrl,
    price: doc.price,
    stock: doc.stock,
    category: doc.category,
    ...(doc.shopkeeperId ? { shopkeeperId: doc.shopkeeperId } : {}),
});
const seedProducts = [
    {
        title: "Premium Hoodie",
        description: "Heavyweight cotton hoodie for daily wear.",
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
        price: 69,
        stock: 30,
        category: "fashion",
    },
    {
        title: "Wireless Keyboard",
        description: "Mechanical feel keyboard with low-latency pairing.",
        imageUrl: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8",
        price: 119,
        stock: 20,
        category: "electronics",
    },
    {
        title: "Running Shoes",
        description: "Cushioned sole designed for long sessions.",
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
        price: 89,
        stock: 45,
        category: "sports",
    },
];
export const productStore = {
    async ensureSeed() {
        const count = await ProductModel.countDocuments().exec();
        if (count === 0) {
            await ProductModel.insertMany(seedProducts);
        }
    },
    async list(input) {
        const filter = {};
        if (input.search) {
            filter.$or = [
                { title: { $regex: input.search, $options: "i" } },
                { description: { $regex: input.search, $options: "i" } },
            ];
        }
        if (input.category) {
            filter.category = input.category;
        }
        if (input.minPrice !== undefined || input.maxPrice !== undefined) {
            filter.price = {
                ...(input.minPrice !== undefined ? { $gte: input.minPrice } : {}),
                ...(input.maxPrice !== undefined ? { $lte: input.maxPrice } : {}),
            };
        }
        const skip = (input.page - 1) * input.limit;
        const [items, total] = await Promise.all([
            ProductModel.find(filter)
                .sort({ _id: -1 })
                .skip(skip)
                .limit(input.limit)
                .lean()
                .exec(),
            ProductModel.countDocuments(filter).exec(),
        ]);
        const totalPages = Math.max(1, Math.ceil(total / input.limit));
        return {
            items: items.map(toEntity),
            pagination: {
                page: input.page,
                limit: input.limit,
                total,
                totalPages,
            },
        };
    },
    async findById(id) {
        const product = await ProductModel.findById(id).lean().exec();
        return product ? toEntity(product) : undefined;
    },
    async findByIdWithShopkeeper(id) {
        const product = await ProductModel.findById(id).lean().exec();
        return product ? toEntityWithShopkeeper(product) : undefined;
    },
    async listByShopkeeperId(shopkeeperId) {
        const items = await ProductModel.find({ shopkeeperId })
            .sort({ _id: -1 })
            .lean()
            .exec();
        return items.map(toEntity);
    },
    async create(input) {
        const product = await ProductModel.create(input);
        return toEntity(product.toObject());
    },
    async updateByShopkeeper(id, shopkeeperId, input) {
        const product = await ProductModel.findOneAndUpdate({ _id: id, shopkeeperId }, input, { new: true })
            .lean()
            .exec();
        return product ? toEntity(product) : undefined;
    },
    async removeByShopkeeper(id, shopkeeperId) {
        const deleted = await ProductModel.findOneAndDelete({
            _id: id,
            shopkeeperId,
        }).exec();
        return Boolean(deleted);
    },
    /**
     * Atomically decrement stock for each item after a successful payment.
     * Returns false if any product has insufficient stock.
     */
    async decrementStock(items) {
        for (const item of items) {
            const result = await ProductModel.findOneAndUpdate({ _id: item.productId, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } }, { new: true }).exec();
            if (!result) {
                return false;
            }
        }
        return true;
    },
    /**
     * Restore stock for each item when an order is cancelled/refunded.
     */
    async restoreStock(items) {
        await Promise.all(items.map((item) => ProductModel.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.quantity },
        }).exec()));
    },
};
