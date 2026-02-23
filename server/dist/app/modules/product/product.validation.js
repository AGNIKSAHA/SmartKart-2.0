import { z } from "zod";
export const createProductSchema = z.object({
    title: z.string().min(2),
    description: z.string().min(5),
    imageUrl: z.string().url(),
    price: z.number().positive(),
    stock: z.number().int().nonnegative(),
    category: z.string().min(2)
});
export const updateProductSchema = createProductSchema.partial();
