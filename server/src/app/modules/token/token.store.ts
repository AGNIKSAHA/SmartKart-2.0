import { Schema, model, type Types } from "mongoose";
import type { RefreshTokenRecord } from "../../common/types/auth.types.js";

interface RefreshTokenDb {
  _id: Types.ObjectId;
  tokenId: string;
  userId: string;
  expiresAt: Date;
  revoked: boolean;
}

const refreshTokenSchema = new Schema(
  {
    tokenId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    revoked: { type: Boolean, required: true, default: false }
  },
  {
    timestamps: false
  }
);

const RefreshTokenModel = model<RefreshTokenDb>("RefreshToken", refreshTokenSchema);

const toEntity = (doc: RefreshTokenDb): RefreshTokenRecord => ({
  id: doc.tokenId,
  userId: doc.userId,
  expiresAt: doc.expiresAt.getTime(),
  revoked: doc.revoked
});

export const tokenStore = {
  async save(record: RefreshTokenRecord): Promise<void> {
    await RefreshTokenModel.create({
      tokenId: record.id,
      userId: record.userId,
      expiresAt: new Date(record.expiresAt),
      revoked: record.revoked
    });
  },

  async findById(id: string): Promise<RefreshTokenRecord | undefined> {
    const token = await RefreshTokenModel.findOne({ tokenId: id }).lean<RefreshTokenDb>().exec();
    return token ? toEntity(token) : undefined;
  },

  async revokeById(id: string): Promise<void> {
    await RefreshTokenModel.updateOne({ tokenId: id }, { $set: { revoked: true } }).exec();
  },

  async revokeByUserId(userId: string): Promise<void> {
    await RefreshTokenModel.updateMany({ userId }, { $set: { revoked: true } }).exec();
  }
};
