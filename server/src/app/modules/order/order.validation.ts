import { z } from "zod";

const phoneRegex = /^[0-9]{7,15}$/;

export const createOrderSchema = z.object({
  shippingDetails: z.object({
    recipientName: z.string().min(2),
    address: z.string().min(5),
    mobileNumber: z.string().regex(phoneRegex, "Invalid mobile number format"),
    alternateNumber: z.string().regex(phoneRegex, "Invalid alternate number format").optional()
  })
});
