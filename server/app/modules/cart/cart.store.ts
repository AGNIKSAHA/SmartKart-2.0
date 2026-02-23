import { Schema, model, type Types } from "mongoose";
import type { CartItemEntity } from "../../common/types/domain.types.js";

interface CartItemDb {
  productId: string;
  quantity: number;
}

interface CartDb {
  _id: Types.ObjectId;
  userId: string;
  items: CartItemDb[];
}

const cartSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    items: [
      {
        productId: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 }
      }
    ]
  },
  {
    timestamps: false
  }
);

const CartModel = model<CartDb>("Cart", cartSchema);

const toEntityItems = (items: CartItemDb[]): CartItemEntity[] =>
  items.map((item) => ({ productId: item.productId, quantity: item.quantity }));

export const cartStore = {
  async getByUserId(userId: string): Promise<CartItemEntity[]> {
    const cart = await CartModel.findOne({ userId }).lean<CartDb>().exec();
    return cart ? toEntityItems(cart.items) : [];
  },

  async setByUserId(userId: string, items: CartItemEntity[]): Promise<void> {
    await CartModel.findOneAndUpdate({ userId }, { $set: { items } }, { upsert: true, new: true }).exec();
  },

  async clearByUserId(userId: string): Promise<void> {
    await CartModel.findOneAndUpdate({ userId }, { $set: { items: [] } }, { upsert: true, new: true }).exec();
  }
};
