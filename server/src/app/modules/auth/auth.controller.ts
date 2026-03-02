import type { Request, Response } from "express";
import { env } from "../../common/config/env.js";
import { AppError } from "../../common/middlewares/error.middleware.js";
import { sendResponse } from "../../common/utils/response.js";
import { authService } from "./auth.service.js";
import { userStore } from "../user/user.store.js";
import type { UserRole } from "../../common/types/auth.types.js";

const isProduction = env.NODE_ENV === "production";

const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  // SameSite=None is required for cross-origin cookies in production (HTTPS).
  // The frontend (smartkart-frontend-kcc1.onrender.com) and backend
  // (smartkart-api.onrender.com) are on different origins — browsers block
  // SameSite=Lax cookies on cross-site requests, causing 401 on every API call.
  // SameSite=None requires Secure=true (only valid over HTTPS).
  // In local dev (HTTP), we fall back to "lax" since "none" requires HTTPS.
  sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
  path: "/",
};

const setAuthCookies = (
  res: Response,
  tokens: {
    accessToken: string;
    refreshToken: string;
    accessMaxAgeMs: number;
    refreshMaxAgeMs: number;
  },
): void => {
  res.cookie("accessToken", tokens.accessToken, {
    ...baseCookieOptions,
    maxAge: tokens.accessMaxAgeMs,
  });

  res.cookie("refreshToken", tokens.refreshToken, {
    ...baseCookieOptions,
    maxAge: tokens.refreshMaxAgeMs,
  });
};

const clearAuthCookies = (res: Response): void => {
  res.clearCookie("accessToken", baseCookieOptions);
  res.clearCookie("refreshToken", baseCookieOptions);
};

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { user } = await authService.register(req.body);
      sendResponse(
        res,
        201,
        "Registration successful. Please verify your email.",
        user,
      );
    } catch (error) {
      console.error("Register Error:", error);
      throw error;
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    const { user, tokens } = await authService.login(req.body);
    setAuthCookies(res, tokens);
    sendResponse(res, 200, "Login successful", user);
  },

  async googleLogin(req: Request, res: Response): Promise<void> {
    const { accessToken, role } = req.body as {
      accessToken: string;
      role?: UserRole;
    };
    const result = await authService.googleLogin(accessToken, role);

    // New user with no role selected yet — signal frontend to show role picker
    if ("needsRole" in result) {
      sendResponse(res, 200, "NEEDS_ROLE", { needsRole: true });
      return;
    }

    setAuthCookies(res, result.tokens);
    sendResponse(res, 201, "Google login successful", result.user);
  },

  async refresh(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies.refreshToken as string | undefined;
    if (!refreshToken) {
      sendResponse(res, 200, "Refresh token missing", null);
      return;
    }

    try {
      const { user, tokens } = await authService.refreshSession(refreshToken);
      setAuthCookies(res, tokens);
      sendResponse(res, 200, "Session refreshed", user);
    } catch {
      clearAuthCookies(res);
      sendResponse(res, 200, "Session expired", null);
    }
  },

  async logout(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const refreshToken = req.cookies.refreshToken as string | undefined;
    await authService.logout(userId, refreshToken);
    clearAuthCookies(res);
    sendResponse(res, 200, "Logout successful", null);
  },

  async me(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      sendResponse(res, 200, "Unauthenticated", null);
      return;
    }

    const user = await userStore.findById(userId);
    if (!user) {
      sendResponse(res, 200, "User not found", null);
      return;
    }

    sendResponse(res, 200, "Current user fetched", {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      isEmailVerified: user.isEmailVerified,
    });
  },

  async verifyEmail(req: Request, res: Response): Promise<void> {
    const payload = req.body as { email: string; token: string };
    await authService.verifyEmail(payload.email, payload.token);
    sendResponse(res, 200, "Email verified successfully", null);
  },

  async resendVerification(req: Request, res: Response): Promise<void> {
    const payload = req.body as { email: string };
    await authService.resendVerification(payload.email);
    sendResponse(
      res,
      200,
      "If your account exists and is unverified, a verification email has been sent",
      null,
    );
  },

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const payload = req.body as { email: string };
    await authService.forgotPassword(payload.email);
    sendResponse(
      res,
      200,
      "If your account exists, a reset email has been sent",
      null,
    );
  },

  async resetPassword(req: Request, res: Response): Promise<void> {
    const payload = req.body as {
      email: string;
      token: string;
      newPassword: string;
    };
    await authService.resetPassword(
      payload.email,
      payload.token,
      payload.newPassword,
    );
    sendResponse(res, 200, "Password reset successful", null);
  },
};
