import { Schema, model, type Types } from "mongoose";
import type { OrderEntity } from "../../common/types/domain.types.js";

interface OrderItemDb {
  productId: string;
  title: string;
  unitPrice: number;
  quantity: number;
}

interface OrderDb {
  _id: Types.ObjectId;
  userId: string;
  items: OrderItemDb[];
  totalAmount: number;
  shippingDetails: {
    recipientName: string;
    address: string;
    mobileNumber: string;
    alternateNumber?: string;
  };
  createdAt: Date;
  status: "pending" | "paid" | "shipped" | "cancelled";
  stripeSessionId?: string;
}

const orderSchema = new Schema(
  {
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
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

const OrderModel = model<OrderDb>("Order", orderSchema);

const toEntity = (doc: OrderDb): OrderEntity => ({
  id: doc._id.toString(),
  userId: doc.userId,
  items: doc.items,
  totalAmount: doc.totalAmount,
  shippingDetails: doc.shippingDetails,
  createdAt: doc.createdAt.toISOString(),
  status: doc.status,
});

export const orderStore = {
  async create(
    order: Omit<OrderEntity, "id" | "createdAt">,
  ): Promise<OrderEntity> {
    const created = await OrderModel.create(order);
    return toEntity(created.toObject());
  },

  async listByUserId(userId: string): Promise<OrderEntity[]> {
    const orders = await OrderModel.find({ userId })
      .sort({ createdAt: -1 })
      .lean<OrderDb[]>()
      .exec();
    return orders.map(toEntity);
  },

  async listAll(): Promise<OrderEntity[]> {
    const orders = await OrderModel.find()
      .sort({ createdAt: -1 })
      .lean<OrderDb[]>()
      .exec();
    return orders.map(toEntity);
  },

  async markAsPaid(orderId: string): Promise<OrderEntity | undefined> {
    const updated = await OrderModel.findOneAndUpdate(
      { _id: orderId, status: "pending" },
      { $set: { status: "paid" } },
      { new: true },
    )
      .lean<OrderDb>()
      .exec();

    return updated ? toEntity(updated) : undefined;
  },

  async cancelByIdForUser(
    orderId: string,
    userId: string,
  ): Promise<OrderEntity | undefined> {
    const updated = await OrderModel.findOneAndUpdate(
      { _id: orderId, userId, status: "pending" },
      { $set: { status: "cancelled" } },
      { new: true },
    )
      .lean<OrderDb>()
      .exec();

    return updated ? toEntity(updated) : undefined;
  },

  async findById(orderId: string): Promise<OrderEntity | undefined> {
    const order = await OrderModel.findById(orderId).lean<OrderDb>().exec();
    return order ? toEntity(order) : undefined;
  },

  /**
   * Cancel a paid order (for refund flow).
   * Returns the order doc including stripeSessionId.
   */
  async cancelPaidOrder(
    orderId: string,
    userId: string,
  ): Promise<(OrderEntity & { stripeSessionId?: string }) | undefined> {
    const updated = await OrderModel.findOneAndUpdate(
      { _id: orderId, userId, status: "paid" },
      { $set: { status: "cancelled" } },
      { new: true },
    )
      .lean<OrderDb>()
      .exec();

    if (!updated) return undefined;

    return {
      ...toEntity(updated),
      ...(updated.stripeSessionId
        ? { stripeSessionId: updated.stripeSessionId }
        : {}),
    };
  },

  async setStripeSessionId(
    orderId: string,
    stripeSessionId: string,
  ): Promise<void> {
    await OrderModel.findByIdAndUpdate(orderId, {
      $set: { stripeSessionId },
    }).exec();
  },
};
