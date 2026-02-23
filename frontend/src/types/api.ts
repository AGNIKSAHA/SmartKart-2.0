export type UserRole = "shopkeeper" | "consumer";

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  isEmailVerified: boolean;
}

export interface ConsumerProfile {
  fullName: string;
  deliveryContacts: Array<{
    recipientName: string;
    address: string;
  }>;
  mobileNumber: string;
  alternateNumber?: string;
}

export interface ShopkeeperProfile {
  companyName: string;
  companyAddress: string;
  mobileNumber: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
}

export interface ProfileResponse {
  id: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  profile: ConsumerProfile | ShopkeeperProfile | null;
}

export interface UpdateConsumerProfilePayload {
  fullName: string;
  deliveryContacts: Array<{
    recipientName: string;
    address: string;
  }>;
  mobileNumber: string;
  alternateNumber?: string;
}

export interface UpdateShopkeeperProfilePayload {
  companyName: string;
  companyAddress: string;
  mobileNumber: string;
  location?: {
    lng: number;
    lat: number;
  };
}

export interface AuthPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyEmailPayload {
  email: string;
  token: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  newPassword: string;
}

export const PRODUCT_CATEGORIES = [
  "fashion",
  "electronics",
  "sports",
  "home",
  "beauty",
  "toys",
  "books",
  "other",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface Product {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  stock: number;
  category: ProductCategory;
  storeName: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  distanceKm?: number;
}

export interface CreateProductPayload {
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  stock: number;
  category: ProductCategory;
  storeName: string;
  location?:
    | {
        lng: number;
        lat: number;
      }
    | undefined;
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {}

export interface ProductQuery {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  lng?: number;
  lat?: number;
}

export interface ProductListResult {
  items: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CartLine {
  productId: string;
  quantity: number;
  product?: Product;
}

export interface UpsertCartInput {
  productId: string;
  quantity: number;
}

export interface Order {
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

export interface CreateOrderPayload {
  shippingDetails: {
    recipientName: string;
    address: string;
    mobileNumber: string;
    alternateNumber?: string;
  };
}

export interface NotificationItem {
  id: string;
  targetRole: UserRole;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  orderId?: string;
}
