import { Schema, model } from "mongoose";
const cartSchema = new Schema({
    userId: { type: String, required: true, unique: true, index: true },
    items: [
        {
            productId: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1 }
        }
    ]
}, {
    timestamps: false
});
const CartModel = model("Cart", cartSchema);
const toEntityItems = (items) => items.map((item) => ({ productId: item.productId, quantity: item.quantity }));
export const cartStore = {
    async getByUserId(userId) {
        const cart = await CartModel.findOne({ userId }).lean().exec();
        return cart ? toEntityItems(cart.items) : [];
    },
    async setByUserId(userId, items) {
        await CartModel.findOneAndUpdate({ userId }, { $set: { items } }, { upsert: true, new: true }).exec();
    },
    async clearByUserId(userId) {
        await CartModel.findOneAndUpdate({ userId }, { $set: { items: [] } }, { upsert: true, new: true }).exec();
    }
};
