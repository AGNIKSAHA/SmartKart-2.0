import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export interface MailPayload {
  to: string;
  subject: string;
  text: string;
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  // Port 587 + STARTTLS is more reliable on Render than 465 (SSL).
  // Port 465 often resolves to an IPv6 address that Render free-tier
  // cannot reach, causing ENETUNREACH / ESOCKET errors.
  port: 587,
  secure: false, // false = STARTTLS (upgrades after connect)
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
  // Force IPv4 — prevents Node from picking an IPv6 address from DNS,
  // which Render's network cannot route to Gmail's SMTP servers.
  family: 4,
} as nodemailer.TransportOptions);

// Skip verification in development — home routers/ISPs commonly block
// outbound port 587, causing a misleading ETIMEDOUT that has no impact
// on actual functionality (emails still send fine in production on Render).
if (env.NODE_ENV === "production") {
  transporter.verify((error) => {
    if (error) {
      console.error("[Mail Service] Transporter verification failed:", error);
    } else {
      console.log("[Mail Service] Transporter is ready to send emails");
    }
  });
} else {
  console.log("[Mail Service] Skipping SMTP verification in development");
}

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
