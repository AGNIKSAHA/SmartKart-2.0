import { Schema, model } from "mongoose";
const refreshTokenSchema = new Schema({
    tokenId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    revoked: { type: Boolean, required: true, default: false }
}, {
    timestamps: false
});
const RefreshTokenModel = model("RefreshToken", refreshTokenSchema);
const toEntity = (doc) => ({
    id: doc.tokenId,
    userId: doc.userId,
    expiresAt: doc.expiresAt.getTime(),
    revoked: doc.revoked
});
export const tokenStore = {
    async save(record) {
        await RefreshTokenModel.create({
            tokenId: record.id,
            userId: record.userId,
            expiresAt: new Date(record.expiresAt),
            revoked: record.revoked
        });
    },
    async findById(id) {
        const token = await RefreshTokenModel.findOne({ tokenId: id }).lean().exec();
        return token ? toEntity(token) : undefined;
    },
    async revokeById(id) {
        await RefreshTokenModel.updateOne({ tokenId: id }, { $set: { revoked: true } }).exec();
    },
    async revokeByUserId(userId) {
        await RefreshTokenModel.updateMany({ userId }, { $set: { revoked: true } }).exec();
    }
};
