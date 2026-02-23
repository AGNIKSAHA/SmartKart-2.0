import { AppError } from "../../common/middleware/error.middleware.js";
import { decryptText, encryptText } from "../../common/utils/crypto.js";
import { sendResponse } from "../../common/utils/response.js";
import { userStore } from "../user/user.store.js";
import { consumerProfileSchema, shopkeeperProfileSchema } from "./profile.validation.js";
const toConsumerResponse = (user) => {
    if (!user.consumerProfile) {
        return null;
    }
    return {
        fullName: user.consumerProfile.fullName,
        deliveryContacts: user.consumerProfile.deliveryContacts,
        mobileNumber: decryptText(user.consumerProfile.mobileEncrypted),
        ...(user.consumerProfile.alternateMobileEncrypted
            ? {
                alternateNumber: decryptText(user.consumerProfile.alternateMobileEncrypted)
            }
            : {})
    };
};
const toShopkeeperResponse = (user) => {
    if (!user.shopkeeperProfile) {
        return null;
    }
    return {
        companyName: user.shopkeeperProfile.companyName,
        companyAddress: user.shopkeeperProfile.companyAddress,
        mobileNumber: decryptText(user.shopkeeperProfile.mobileEncrypted)
    };
};
export const profileController = {
    async getMyProfile(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }
        const user = await userStore.findById(userId);
        if (!user) {
            throw new AppError("User not found", 404);
        }
        sendResponse(res, 200, "Profile fetched", {
            id: user.id,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            ...(user.role === "consumer"
                ? {
                    profile: toConsumerResponse(user)
                }
                : {
                    profile: toShopkeeperResponse(user)
                })
        });
    },
    async updateMyProfile(req, res) {
        const userId = req.user?.id;
        const role = req.user?.role;
        if (!userId || !role) {
            throw new AppError("Unauthorized", 401);
        }
        if (role === "consumer") {
            const payload = consumerProfileSchema.parse(req.body);
            const updated = await userStore.updateConsumerProfile(userId, {
                fullName: payload.fullName,
                deliveryContacts: payload.deliveryContacts,
                mobileEncrypted: encryptText(payload.mobileNumber),
                ...(payload.alternateNumber
                    ? {
                        alternateMobileEncrypted: encryptText(payload.alternateNumber)
                    }
                    : {})
            });
            if (!updated) {
                throw new AppError("User not found", 404);
            }
            sendResponse(res, 200, "Profile updated", {
                id: updated.id,
                email: updated.email,
                role: updated.role,
                isEmailVerified: updated.isEmailVerified,
                profile: toConsumerResponse(updated)
            });
            return;
        }
        const payload = shopkeeperProfileSchema.parse(req.body);
        const updated = await userStore.updateShopkeeperProfile(userId, {
            companyName: payload.companyName,
            companyAddress: payload.companyAddress,
            mobileEncrypted: encryptText(payload.mobileNumber)
        });
        if (!updated) {
            throw new AppError("User not found", 404);
        }
        sendResponse(res, 200, "Profile updated", {
            id: updated.id,
            email: updated.email,
            role: updated.role,
            isEmailVerified: updated.isEmailVerified,
            profile: toShopkeeperResponse(updated)
        });
    }
};
