import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "./error.middleware.js";
export const requireAuth = (req, _res, next) => {
    const bearer = req.headers.authorization;
    const tokenFromHeader = bearer?.startsWith("Bearer ")
        ? bearer.slice(7)
        : undefined;
    const token = req.cookies.accessToken ?? tokenFromHeader;
    if (!token) {
        next(new AppError("Unauthorized", 401));
        return;
    }
    try {
        const payload = verifyAccessToken(token);
        req.user = {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
        };
        next();
    }
    catch {
        next(new AppError("Invalid access token", 401));
    }
};
export const optionalAuth = (req, _res, next) => {
    const bearer = req.headers.authorization;
    const tokenFromHeader = bearer?.startsWith("Bearer ")
        ? bearer.slice(7)
        : undefined;
    const token = req.cookies.accessToken ?? tokenFromHeader;
    if (!token) {
        next();
        return;
    }
    try {
        const payload = verifyAccessToken(token);
        req.user = {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
        };
    }
    catch {
        // If invalid token, ignore and proceed as unauthenticated
    }
    next();
};
export const requireRole = (...allowedRoles) => {
    return (req, _res, next) => {
        if (!req.user) {
            next(new AppError("Unauthorized", 401));
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            next(new AppError("Forbidden", 403));
            return;
        }
        next();
    };
};
