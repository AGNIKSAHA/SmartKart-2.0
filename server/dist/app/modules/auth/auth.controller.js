import { env } from "../../common/config/env.js";
import { AppError } from "../../common/middleware/error.middleware.js";
import { sendResponse } from "../../common/utils/response.js";
import { authService } from "./auth.service.js";
import { userStore } from "../user/user.store.js";
const baseCookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
};
const setAuthCookies = (res, tokens) => {
    res.cookie("accessToken", tokens.accessToken, {
        ...baseCookieOptions,
        maxAge: tokens.accessMaxAgeMs,
    });
    res.cookie("refreshToken", tokens.refreshToken, {
        ...baseCookieOptions,
        maxAge: tokens.refreshMaxAgeMs,
    });
};
const clearAuthCookies = (res) => {
    res.clearCookie("accessToken", baseCookieOptions);
    res.clearCookie("refreshToken", baseCookieOptions);
};
export const authController = {
    async register(req, res) {
        const { user } = await authService.register(req.body);
        sendResponse(res, 201, "Registration successful. Please verify your email.", user);
    },
    async login(req, res) {
        const { user, tokens } = await authService.login(req.body);
        setAuthCookies(res, tokens);
        sendResponse(res, 200, "Login successful", user);
    },
    async refresh(req, res) {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            sendResponse(res, 200, "Refresh token missing", null);
            return;
        }
        try {
            const { user, tokens } = await authService.refreshSession(refreshToken);
            setAuthCookies(res, tokens);
            sendResponse(res, 200, "Session refreshed", user);
        }
        catch {
            clearAuthCookies(res);
            sendResponse(res, 200, "Session expired", null);
        }
    },
    async logout(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }
        const refreshToken = req.cookies.refreshToken;
        await authService.logout(userId, refreshToken);
        clearAuthCookies(res);
        sendResponse(res, 200, "Logout successful", null);
    },
    async me(req, res) {
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
    async verifyEmail(req, res) {
        const payload = req.body;
        await authService.verifyEmail(payload.email, payload.token);
        sendResponse(res, 200, "Email verified successfully", null);
    },
    async resendVerification(req, res) {
        const payload = req.body;
        await authService.resendVerification(payload.email);
        sendResponse(res, 200, "If your account exists and is unverified, a verification email has been sent", null);
    },
    async forgotPassword(req, res) {
        const payload = req.body;
        await authService.forgotPassword(payload.email);
        sendResponse(res, 200, "If your account exists, a reset email has been sent", null);
    },
    async resetPassword(req, res) {
        const payload = req.body;
        await authService.resetPassword(payload.email, payload.token, payload.newPassword);
        sendResponse(res, 200, "Password reset successful", null);
    },
};
