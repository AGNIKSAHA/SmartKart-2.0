import { Schema, model } from "mongoose";
const notificationSchema = new Schema({
    targetRole: { type: String, enum: ["shopkeeper", "consumer"], required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, required: true, default: false, index: true },
    orderId: { type: String, required: false }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});
const NotificationModel = model("Notification", notificationSchema);
const toEntity = (doc) => ({
    id: doc._id.toString(),
    targetRole: doc.targetRole,
    title: doc.title,
    message: doc.message,
    isRead: doc.isRead,
    createdAt: doc.createdAt.toISOString(),
    ...(doc.orderId ? { orderId: doc.orderId } : {})
});
export const notificationStore = {
    async create(input) {
        await NotificationModel.create({
            targetRole: input.targetRole,
            title: input.title,
            message: input.message,
            isRead: input.isRead ?? false,
            ...(input.orderId ? { orderId: input.orderId } : {})
        });
    },
    async listByRole(role, limit = 30) {
        const items = await NotificationModel.find({ targetRole: role })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean()
            .exec();
        return items.map(toEntity);
    },
    async unreadCountByRole(role) {
        return NotificationModel.countDocuments({ targetRole: role, isRead: false }).exec();
    },
    async markRead(id, role) {
        const updated = await NotificationModel.findOneAndUpdate({ _id: id, targetRole: role }, { $set: { isRead: true } }, { new: true })
            .lean()
            .exec();
        return updated ? toEntity(updated) : undefined;
    }
};
