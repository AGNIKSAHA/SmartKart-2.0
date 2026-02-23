import type { UserRole } from "./auth.types.js";

export interface ConsumerProfileEntity {
  fullName: string;
  deliveryContacts: Array<{
    recipientName: string;
    address: string;
  }>;
  mobileEncrypted: string;
  alternateMobileEncrypted?: string;
}

export interface ShopkeeperProfileEntity {
  companyName: string;
  companyAddress: string;
  mobileEncrypted: string;
  location?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface UserEntity {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  isEmailVerified: boolean;
  consumerProfile?: ConsumerProfileEntity;
  shopkeeperProfile?: ShopkeeperProfileEntity;
  emailVerificationTokenHash?: string;
  emailVerificationExpiresAt?: string;
  passwordResetTokenHash?: string;
  passwordResetExpiresAt?: string;
}

export interface ProductEntity {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  stock: number;
  category: string;
  storeName: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  distanceKm?: number;
}

export interface CartItemEntity {
  productId: string;
  quantity: number;
}

export interface OrderEntity {
  id: string;
  userId: string;
  items: Array<{
    productId: string;
    title: string;
    unitPrice: number;
    quantity: number;
  }>;
  totalAmount: number;
  shippingDetails: {
    recipientName: string;
    address: string;
    mobileNumber: string;
    alternateNumber?: string;
  };
  createdAt: string;
  status: "pending" | "paid" | "shipped" | "cancelled";
}

export interface NotificationEntity {
  id: string;
  targetRole: UserRole;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  orderId?: string;
}
