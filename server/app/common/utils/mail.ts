import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export interface MailPayload {
  to: string;
  subject: string;
  text: string;
}

const transporter = nodemailer.createTransport({
  service: env.MAIL_SERVICE,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
  family: 4, // Force IPv4 to avoid ENETUNREACH on Node 18+ (Render/Docker)
} as any);

export const sendEmail = async (payload: MailPayload): Promise<void> => {
  await transporter.sendMail({
    from: env.EMAIL_USER,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
  });
};
