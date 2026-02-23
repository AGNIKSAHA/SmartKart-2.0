import { Schema, model, type Types } from "mongoose";
import type {
  ConsumerProfileEntity,
  ShopkeeperProfileEntity,
  UserEntity,
} from "../../common/types/domain.types.js";
import type { UserRole } from "../../common/types/auth.types.js";

interface UserDb {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  isEmailVerified: boolean;
  consumerProfile?: {
    fullName: string;
    deliveryContacts: Array<{
      recipientName: string;
      address: string;
    }>;
    mobileEncrypted: string;
    alternateMobileEncrypted?: string;
  };
  shopkeeperProfile?: {
    companyName: string;
    companyAddress: string;
    mobileEncrypted: string;
    location?: {
      type: "Point";
      coordinates: [number, number];
    };
  };
  emailVerificationTokenHash?: string;
  emailVerificationExpiresAt?: Date;
  passwordResetTokenHash?: string;
  passwordResetExpiresAt?: Date;
}

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["shopkeeper", "consumer"], required: true },
    isEmailVerified: { type: Boolean, required: true, default: false },
    consumerProfile: {
      fullName: { type: String, required: false },
      deliveryContacts: [
        {
          recipientName: { type: String, required: false },
          address: { type: String, required: false },
        },
      ],
      mobileEncrypted: { type: String, required: false },
      alternateMobileEncrypted: { type: String, required: false },
    },
    shopkeeperProfile: {
      companyName: { type: String, required: false },
      companyAddress: { type: String, required: false },
      mobileEncrypted: { type: String, required: false },
      location: {
        type: { type: String, enum: ["Point"] },
        coordinates: { type: [Number] },
      },
    },
    emailVerificationTokenHash: { type: String, required: false },
    emailVerificationExpiresAt: { type: Date, required: false },
    passwordResetTokenHash: { type: String, required: false },
    passwordResetExpiresAt: { type: Date, required: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

userSchema.index({ "shopkeeperProfile.location": "2dsphere" });

const UserModel = model<UserDb>("User", userSchema);

const toConsumerProfile = (
  profile: UserDb["consumerProfile"],
): ConsumerProfileEntity | undefined => {
  if (!profile?.fullName || !profile.mobileEncrypted) {
    return undefined;
  }

  return {
    fullName: profile.fullName,
    deliveryContacts: profile.deliveryContacts,
    mobileEncrypted: profile.mobileEncrypted,
    ...(profile.alternateMobileEncrypted
      ? {
          alternateMobileEncrypted: profile.alternateMobileEncrypted,
        }
      : {}),
  };
};

const toShopkeeperProfile = (
  profile: UserDb["shopkeeperProfile"],
): ShopkeeperProfileEntity | undefined => {
  if (
    !profile?.companyName ||
    !profile.companyAddress ||
    !profile.mobileEncrypted
  ) {
    return undefined;
  }

  return {
    companyName: profile.companyName,
    companyAddress: profile.companyAddress,
    mobileEncrypted: profile.mobileEncrypted,
    ...(profile.location ? { location: profile.location } : {}),
  };
};

const toEntity = (doc: UserDb): UserEntity => {
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
          emailVerificationTokenHash: doc.emailVerificationTokenHash,
        }
      : {}),
    ...(doc.emailVerificationExpiresAt
      ? {
          emailVerificationExpiresAt:
            doc.emailVerificationExpiresAt.toISOString(),
        }
      : {}),
    ...(doc.passwordResetTokenHash
      ? {
          passwordResetTokenHash: doc.passwordResetTokenHash,
        }
      : {}),
    ...(doc.passwordResetExpiresAt
      ? {
          passwordResetExpiresAt: doc.passwordResetExpiresAt.toISOString(),
        }
      : {}),
  };
};

export const userStore = {
  async create(
    input: Omit<UserEntity, "id" | "createdAt">,
  ): Promise<UserEntity> {
    const user = await UserModel.create(input);
    return toEntity(user.toObject());
  },

  async findByEmail(email: string): Promise<UserEntity | undefined> {
    const user = await UserModel.findOne({ email: email.toLowerCase() })
      .lean<UserDb>()
      .exec();
    return user ? toEntity(user) : undefined;
  },

  async findById(id: string): Promise<UserEntity | undefined> {
    const user = await UserModel.findById(id).lean<UserDb>().exec();
    return user ? toEntity(user) : undefined;
  },

  async list(): Promise<UserEntity[]> {
    const users = await UserModel.find().lean<UserDb[]>().exec();
    return users.map(toEntity);
  },

  async updateConsumerProfile(
    userId: string,
    profile: {
      fullName: string;
      deliveryContacts: Array<{
        recipientName: string;
        address: string;
      }>;
      mobileEncrypted: string;
      alternateMobileEncrypted?: string;
    },
  ): Promise<UserEntity | undefined> {
    const updated = await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          consumerProfile: {
            fullName: profile.fullName,
            deliveryContacts: profile.deliveryContacts,
            mobileEncrypted: profile.mobileEncrypted,
            ...(profile.alternateMobileEncrypted
              ? {
                  alternateMobileEncrypted: profile.alternateMobileEncrypted,
                }
              : {}),
          },
        },
      },
      { new: true },
    )
      .lean<UserDb>()
      .exec();

    return updated ? toEntity(updated) : undefined;
  },

  async updateShopkeeperProfile(
    userId: string,
    profile: {
      companyName: string;
      companyAddress: string;
      mobileEncrypted: string;
      location?: { type: "Point"; coordinates: [number, number] };
    },
  ): Promise<UserEntity | undefined> {
    const updated = await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          shopkeeperProfile: {
            companyName: profile.companyName,
            companyAddress: profile.companyAddress,
            mobileEncrypted: profile.mobileEncrypted,
            location: profile.location,
          },
        },
      },
      { new: true },
    )
      .lean<UserDb>()
      .exec();

    return updated ? toEntity(updated) : undefined;
  },

  async findNearbyShops(
    lng: number,
    lat: number,
    maxDistanceKm: number,
  ): Promise<Array<UserEntity & { distanceKm: number }>> {
    const shops = await UserModel.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "distanceMeters",
          maxDistance: maxDistanceKm * 1000,
          query: {
            role: "shopkeeper",
            "shopkeeperProfile.location": { $exists: true },
          },
          spherical: true,
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          createdAt: 1,
          isEmailVerified: 1,
          shopkeeperProfile: 1,
          distanceKm: { $divide: ["$distanceMeters", 1000] },
        },
      },
    ]).exec();

    return shops.map((s) => ({
      ...toEntity(s as UserDb),
      distanceKm: s.distanceKm,
    }));
  },

  async setEmailVerificationToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          emailVerificationTokenHash: tokenHash,
          emailVerificationExpiresAt: expiresAt,
        },
      },
    ).exec();
  },

  async verifyEmail(email: string, tokenHash: string): Promise<boolean> {
    const updated = await UserModel.updateOne(
      {
        email: email.toLowerCase(),
        emailVerificationTokenHash: tokenHash,
        emailVerificationExpiresAt: { $gt: new Date() },
      },
      {
        $set: { isEmailVerified: true },
        $unset: {
          emailVerificationTokenHash: "",
          emailVerificationExpiresAt: "",
        },
      },
    ).exec();

    return updated.modifiedCount > 0;
  },

  async setPasswordResetToken(
    email: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<boolean> {
    const updated = await UserModel.updateOne(
      { email: email.toLowerCase(), isEmailVerified: true },
      {
        $set: {
          passwordResetTokenHash: tokenHash,
          passwordResetExpiresAt: expiresAt,
        },
      },
    ).exec();

    return updated.modifiedCount > 0;
  },

  async resetPassword(
    email: string,
    tokenHash: string,
    passwordHash: string,
  ): Promise<boolean> {
    const updated = await UserModel.updateOne(
      {
        email: email.toLowerCase(),
        isEmailVerified: true,
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: { $gt: new Date() },
      },
      {
        $set: { passwordHash },
        $unset: { passwordResetTokenHash: "", passwordResetExpiresAt: "" },
      },
    ).exec();

    return updated.modifiedCount > 0;
  },
};
