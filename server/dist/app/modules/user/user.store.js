import { Schema, model } from "mongoose";
const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["shopkeeper", "consumer"], required: true },
    isEmailVerified: { type: Boolean, required: true, default: false },
    consumerProfile: {
        fullName: { type: String, required: false },
        deliveryContacts: [
            {
                recipientName: { type: String, required: false },
                address: { type: String, required: false }
            }
        ],
        mobileEncrypted: { type: String, required: false },
        alternateMobileEncrypted: { type: String, required: false }
    },
    shopkeeperProfile: {
        companyName: { type: String, required: false },
        companyAddress: { type: String, required: false },
        mobileEncrypted: { type: String, required: false }
    },
    emailVerificationTokenHash: { type: String, required: false },
    emailVerificationExpiresAt: { type: Date, required: false },
    passwordResetTokenHash: { type: String, required: false },
    passwordResetExpiresAt: { type: Date, required: false }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});
const UserModel = model("User", userSchema);
const toConsumerProfile = (profile) => {
    if (!profile?.fullName || !profile.mobileEncrypted) {
        return undefined;
    }
    return {
        fullName: profile.fullName,
        deliveryContacts: profile.deliveryContacts,
        mobileEncrypted: profile.mobileEncrypted,
        ...(profile.alternateMobileEncrypted
            ? {
                alternateMobileEncrypted: profile.alternateMobileEncrypted
            }
            : {})
    };
};
const toShopkeeperProfile = (profile) => {
    if (!profile?.companyName || !profile.companyAddress || !profile.mobileEncrypted) {
        return undefined;
    }
    return {
        companyName: profile.companyName,
        companyAddress: profile.companyAddress,
        mobileEncrypted: profile.mobileEncrypted
    };
};
const toEntity = (doc) => {
    const consumerProfile = toConsumerProfile(doc.consumerProfile);
    const shopkeeperProfile = toShopkeeperProfile(doc.shopkeeperProfile);
    return {
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        passwordHash: doc.passwordHash,
        role: doc.role,
        createdAt: doc.createdAt.toISOString(),
        isEmailVerified: doc.isEmailVerified,
        ...(consumerProfile ? { consumerProfile } : {}),
        ...(shopkeeperProfile ? { shopkeeperProfile } : {}),
        ...(doc.emailVerificationTokenHash
            ? {
                emailVerificationTokenHash: doc.emailVerificationTokenHash
            }
            : {}),
        ...(doc.emailVerificationExpiresAt
            ? {
                emailVerificationExpiresAt: doc.emailVerificationExpiresAt.toISOString()
            }
            : {}),
        ...(doc.passwordResetTokenHash
            ? {
                passwordResetTokenHash: doc.passwordResetTokenHash
            }
            : {}),
        ...(doc.passwordResetExpiresAt
            ? {
                passwordResetExpiresAt: doc.passwordResetExpiresAt.toISOString()
            }
            : {})
    };
};
export const userStore = {
    async create(input) {
        const user = await UserModel.create(input);
        return toEntity(user.toObject());
    },
    async findByEmail(email) {
        const user = await UserModel.findOne({ email: email.toLowerCase() }).lean().exec();
        return user ? toEntity(user) : undefined;
    },
    async findById(id) {
        const user = await UserModel.findById(id).lean().exec();
        return user ? toEntity(user) : undefined;
    },
    async list() {
        const users = await UserModel.find().lean().exec();
        return users.map(toEntity);
    },
    async updateConsumerProfile(userId, profile) {
        const updated = await UserModel.findByIdAndUpdate(userId, {
            $set: {
                consumerProfile: {
                    fullName: profile.fullName,
                    deliveryContacts: profile.deliveryContacts,
                    mobileEncrypted: profile.mobileEncrypted,
                    ...(profile.alternateMobileEncrypted
                        ? {
                            alternateMobileEncrypted: profile.alternateMobileEncrypted
                        }
                        : {})
                }
            }
        }, { new: true })
            .lean()
            .exec();
        return updated ? toEntity(updated) : undefined;
    },
    async updateShopkeeperProfile(userId, profile) {
        const updated = await UserModel.findByIdAndUpdate(userId, {
            $set: {
                shopkeeperProfile: {
                    companyName: profile.companyName,
                    companyAddress: profile.companyAddress,
                    mobileEncrypted: profile.mobileEncrypted
                }
            }
        }, { new: true })
            .lean()
            .exec();
        return updated ? toEntity(updated) : undefined;
    },
    async setEmailVerificationToken(userId, tokenHash, expiresAt) {
        await UserModel.updateOne({ _id: userId }, { $set: { emailVerificationTokenHash: tokenHash, emailVerificationExpiresAt: expiresAt } }).exec();
    },
    async verifyEmail(email, tokenHash) {
        const updated = await UserModel.updateOne({
            email: email.toLowerCase(),
            emailVerificationTokenHash: tokenHash,
            emailVerificationExpiresAt: { $gt: new Date() }
        }, {
            $set: { isEmailVerified: true },
            $unset: { emailVerificationTokenHash: "", emailVerificationExpiresAt: "" }
        }).exec();
        return updated.modifiedCount > 0;
    },
    async setPasswordResetToken(email, tokenHash, expiresAt) {
        const updated = await UserModel.updateOne({ email: email.toLowerCase(), isEmailVerified: true }, { $set: { passwordResetTokenHash: tokenHash, passwordResetExpiresAt: expiresAt } }).exec();
        return updated.modifiedCount > 0;
    },
    async resetPassword(email, tokenHash, passwordHash) {
        const updated = await UserModel.updateOne({
            email: email.toLowerCase(),
            isEmailVerified: true,
            passwordResetTokenHash: tokenHash,
            passwordResetExpiresAt: { $gt: new Date() }
        }, {
            $set: { passwordHash },
            $unset: { passwordResetTokenHash: "", passwordResetExpiresAt: "" }
        }).exec();
        return updated.modifiedCount > 0;
    }
};
