import { Schema, model } from "mongoose";
const orderSchema = new Schema({
    userId: { type: String, required: true, index: true },
    items: [
        {
            productId: { type: String, required: true },
            title: { type: String, required: true },
            unitPrice: { type: Number, required: true },
            quantity: { type: Number, required: true },
        },
    ],
    totalAmount: { type: Number, required: true },
    shippingDetails: {
        recipientName: { type: String, required: true },
        address: { type: String, required: true },
        mobileNumber: { type: String, required: true },
        alternateNumber: { type: String, required: false },
    },
    status: {
        type: String,
        enum: ["pending", "paid", "shipped", "cancelled"],
        required: true,
    },
    stripeSessionId: { type: String, required: false },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});
const OrderModel = model("Order", orderSchema);
const toEntity = (doc) => ({
    id: doc._id.toString(),
    userId: doc.userId,
    items: doc.items,
    totalAmount: doc.totalAmount,
    shippingDetails: doc.shippingDetails,
    createdAt: doc.createdAt.toISOString(),
    status: doc.status,
});
export const orderStore = {
    async create(order) {
        const created = await OrderModel.create(order);
        return toEntity(created.toObject());
    },
    async listByUserId(userId) {
        const orders = await OrderModel.find({ userId })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        return orders.map(toEntity);
    },
    async listAll() {
        const orders = await OrderModel.find()
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        return orders.map(toEntity);
    },
    async markAsPaid(orderId) {
        const updated = await OrderModel.findOneAndUpdate({ _id: orderId, status: "pending" }, { $set: { status: "paid" } }, { new: true })
            .lean()
            .exec();
        return updated ? toEntity(updated) : undefined;
    },
    async cancelByIdForUser(orderId, userId) {
        const updated = await OrderModel.findOneAndUpdate({ _id: orderId, userId, status: "pending" }, { $set: { status: "cancelled" } }, { new: true })
            .lean()
            .exec();
        return updated ? toEntity(updated) : undefined;
    },
    async findById(orderId) {
        const order = await OrderModel.findById(orderId).lean().exec();
        return order ? toEntity(order) : undefined;
    },
    /**
     * Cancel a paid order (for refund flow).
     * Returns the order doc including stripeSessionId.
     */
    async cancelPaidOrder(orderId, userId) {
        const updated = await OrderModel.findOneAndUpdate({ _id: orderId, userId, status: "paid" }, { $set: { status: "cancelled" } }, { new: true })
            .lean()
            .exec();
        if (!updated)
            return undefined;
        return {
            ...toEntity(updated),
            ...(updated.stripeSessionId
                ? { stripeSessionId: updated.stripeSessionId }
                : {}),
        };
    },
    async setStripeSessionId(orderId, stripeSessionId) {
        await OrderModel.findByIdAndUpdate(orderId, {
            $set: { stripeSessionId },
        }).exec();
    },
};
