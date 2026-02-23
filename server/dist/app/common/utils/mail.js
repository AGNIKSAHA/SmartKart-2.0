import nodemailer from "nodemailer";
import { env } from "../config/env.js";
const transporter = nodemailer.createTransport({
    service: env.MAIL_SERVICE,
    auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
    },
    family: 4, // Force IPv4 to avoid ENETUNREACH on Node 18+ (Render/Docker)
});
// Internal use only - used by Trigger.dev task
export const sendEmailDirectly = async (payload) => {
    await transporter.sendMail({
        from: env.EMAIL_USER,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
    });
};
// This will be replaced by the trigger call
export const sendEmail = async (payload) => {
    // Dynamic import to avoid circular dependency issues if any
    const { emailTask } = await import("../../trigger/email.task.js");
    await emailTask.trigger(payload);
};
