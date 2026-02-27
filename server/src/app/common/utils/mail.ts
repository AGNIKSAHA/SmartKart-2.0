import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export interface MailPayload {
  to: string;
  subject: string;
  text: string;
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
} as nodemailer.TransportOptions);

// Verify connection configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("[Mail Service] Transporter verification failed:", error);
  } else {
    console.log("[Mail Service] Transporter is ready to send emails");
  }
});

export const sendEmail = async (payload: MailPayload): Promise<void> => {
  console.log(`[Mail Service] Attempting to send email to: ${payload.to}`);
  try {
    await transporter.sendMail({
      from: env.EMAIL_USER,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
    });
    console.log(`[Mail Service] Email sent successfully to: ${payload.to}`);
  } catch (error) {
    console.error(
      `[Mail Service] Detailed error sending email to ${payload.to}:`,
      error,
    );
    throw error;
  }
};
