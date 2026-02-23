import { z } from "zod";

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

export const createProductSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(5),
  imageUrl: z.string().url(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  category: z.enum(PRODUCT_CATEGORIES),
  storeName: z.string().min(1),
  location: z
    .object({
      lng: z.number().min(-180).max(180),
      lat: z.number().min(-90).max(90),
    })
    .optional(),
});

export const updateProductSchema = createProductSchema.partial();
