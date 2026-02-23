import { z } from "zod";

const phoneRegex = /^[0-9]{7,15}$/;

export const consumerProfileSchema = z.object({
  fullName: z.string().min(2),
  deliveryContacts: z
    .array(
      z.object({
        recipientName: z.string().min(2),
        address: z.string().min(5),
      }),
    )
    .min(1),
  mobileNumber: z.string().regex(phoneRegex, "Invalid mobile number format"),
  alternateNumber: z
    .string()
    .regex(phoneRegex, "Invalid alternate number format")
    .optional(),
});

export const shopkeeperProfileSchema = z.object({
  companyName: z.string().min(2),
  companyAddress: z.string().min(5),
  mobileNumber: z.string().regex(phoneRegex, "Invalid mobile number format"),
  location: z
    .object({
      lng: z.number().min(-180).max(180),
      lat: z.number().min(-90).max(90),
    })
    .optional(),
});
