import { Schema, model, type Types } from "mongoose";
import type { NotificationEntity } from "../../common/types/domain.types.js";
import type { UserRole } from "../../common/types/auth.types.js";

interface NotificationDb {
  _id: Types.ObjectId;
  targetRole: UserRole;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  orderId?: string;
}

const notificationSchema = new Schema(
  {
    targetRole: { type: String, enum: ["shopkeeper", "consumer"], required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, required: true, default: false, index: true },
    orderId: { type: String, required: false }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

const NotificationModel = model<NotificationDb>("Notification", notificationSchema);

const toEntity = (doc: NotificationDb): NotificationEntity => ({
  id: doc._id.toString(),
  targetRole: doc.targetRole,
  title: doc.title,
  message: doc.message,
  isRead: doc.isRead,
  createdAt: doc.createdAt.toISOString(),
  ...(doc.orderId ? { orderId: doc.orderId } : {})
});

export const notificationStore = {
  async create(input: Omit<NotificationEntity, "id" | "createdAt" | "isRead"> & { isRead?: boolean }): Promise<void> {
    await NotificationModel.create({
      targetRole: input.targetRole,
      title: input.title,
      message: input.message,
      isRead: input.isRead ?? false,
      ...(input.orderId ? { orderId: input.orderId } : {})
    });
  },

  async listByRole(role: UserRole, limit = 30): Promise<NotificationEntity[]> {
    const items = await NotificationModel.find({ targetRole: role })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean<NotificationDb[]>()
      .exec();

    return items.map(toEntity);
  },

  async unreadCountByRole(role: UserRole): Promise<number> {
    return NotificationModel.countDocuments({ targetRole: role, isRead: false }).exec();
  },

  async markRead(id: string, role: UserRole): Promise<NotificationEntity | undefined> {
    const updated = await NotificationModel.findOneAndUpdate(
      { _id: id, targetRole: role },
      { $set: { isRead: true } },
      { new: true }
    )
      .lean<NotificationDb>()
      .exec();

    return updated ? toEntity(updated) : undefined;
  }
};
