import { Router } from "express";
import {
  requireAuth,
  optionalAuth,
} from "../../common/middleware/auth.middleware.js";
import { validateBody } from "../../common/middleware/validate.middleware.js";
import { authController } from "./auth.controller.js";
import {
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.validation.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  validateBody(registerSchema),
  authController.register,
);
authRouter.post("/login", validateBody(loginSchema), authController.login);
authRouter.post(
  "/verify-email",
  validateBody(verifyEmailSchema),
  authController.verifyEmail,
);
authRouter.post(
  "/resend-verification",
  validateBody(emailSchema),
  authController.resendVerification,
);
authRouter.post(
  "/forgot-password",
  validateBody(emailSchema),
  authController.forgotPassword,
);
authRouter.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  authController.resetPassword,
);
authRouter.post("/refresh", authController.refresh);
authRouter.post("/logout", requireAuth, authController.logout);
authRouter.get("/me", optionalAuth, authController.me);
