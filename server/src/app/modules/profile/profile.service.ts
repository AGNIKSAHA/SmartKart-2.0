import { AppError } from "../../common/middlewares/error.middleware.js";
import type { UserEntity } from "../../common/types/domain.types.js";
import { decryptText, encryptText } from "../../common/utils/crypto.js";
import { userStore } from "../user/user.store.js";
import {
  consumerProfileSchema,
  shopkeeperProfileSchema,
} from "./profile.validation.js";

const toConsumerResponse = (
  user: UserEntity,
): {
  fullName: string;
  deliveryContacts: Array<{
    recipientName: string;
    address: string;
  }>;
  mobileNumber: string;
  alternateNumber?: string;
} | null => {
  if (!user.consumerProfile) {
    return null;
  }

  return {
    fullName: user.consumerProfile.fullName,
    deliveryContacts: user.consumerProfile.deliveryContacts,
    mobileNumber: decryptText(user.consumerProfile.mobileEncrypted),
    ...(user.consumerProfile.alternateMobileEncrypted
      ? {
          alternateNumber: decryptText(
            user.consumerProfile.alternateMobileEncrypted,
          ),
        }
      : {}),
  };
};

const toShopkeeperResponse = (
  user: UserEntity,
): {
  companyName: string;
  companyAddress: string;
  mobileNumber: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
} | null => {
  if (!user.shopkeeperProfile) {
    return null;
  }

  return {
    companyName: user.shopkeeperProfile.companyName,
    companyAddress: user.shopkeeperProfile.companyAddress,
    mobileNumber: decryptText(user.shopkeeperProfile.mobileEncrypted),
    ...(user.shopkeeperProfile.location
      ? { location: user.shopkeeperProfile.location }
      : {}),
  };
};

export const profileService = {
  async getMyProfile(userId: string) {
    const user = await userStore.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      ...(user.role === "consumer"
        ? {
            profile: toConsumerResponse(user),
          }
        : {
            profile: toShopkeeperResponse(user),
          }),
    };
  },

  async updateMyProfile(userId: string, role: string, body: unknown) {
    if (role === "consumer") {
      const payload = consumerProfileSchema.parse(body);
      const updated = await userStore.updateConsumerProfile(userId, {
        fullName: payload.fullName,
        deliveryContacts: payload.deliveryContacts,
        mobileEncrypted: encryptText(payload.mobileNumber),
        ...(payload.alternateNumber
          ? {
              alternateMobileEncrypted: encryptText(payload.alternateNumber),
            }
          : {}),
      });

      if (!updated) {
        throw new AppError("User not found", 404);
      }

      return {
        id: updated.id,
        email: updated.email,
        role: updated.role,
        isEmailVerified: updated.isEmailVerified,
        profile: toConsumerResponse(updated),
      };
    }

    const payload = shopkeeperProfileSchema.parse(body);
    const updated = await userStore.updateShopkeeperProfile(userId, {
      companyName: payload.companyName,
      companyAddress: payload.companyAddress,
      mobileEncrypted: encryptText(payload.mobileNumber),
      ...(payload.location
        ? {
            location: {
              type: "Point" as const,
              coordinates: [payload.location.lng, payload.location.lat] as [
                number,
                number,
              ],
            },
          }
        : {}),
    });

    if (!updated) {
      throw new AppError("User not found", 404);
    }

    return {
      id: updated.id,
      email: updated.email,
      role: updated.role,
      isEmailVerified: updated.isEmailVerified,
      profile: toShopkeeperResponse(updated),
    };
  },
};
