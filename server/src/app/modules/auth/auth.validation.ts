import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["shopkeeper", "consumer"]).default("consumer")
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const emailSchema = z.object({
  email: z.string().email()
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  token: z.string().min(10)
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  token: z.string().min(10),
  newPassword: z.string().min(8)
});
