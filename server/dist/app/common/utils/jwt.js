import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export const signAccessToken = (payload) => {
    const accessPayload = { ...payload, type: "access" };
    const expiresIn = env.ACCESS_TOKEN_EXPIRES_IN;
    return jwt.sign(accessPayload, env.ACCESS_TOKEN_SECRET, {
        expiresIn
    });
};
export const signRefreshToken = (payload) => {
    const refreshPayload = { ...payload, type: "refresh" };
    const expiresIn = env.REFRESH_TOKEN_EXPIRES_IN;
    return jwt.sign(refreshPayload, env.REFRESH_TOKEN_SECRET, {
        expiresIn
    });
};
export const verifyAccessToken = (token) => {
    return jwt.verify(token, env.ACCESS_TOKEN_SECRET);
};
export const verifyRefreshToken = (token) => {
    return jwt.verify(token, env.REFRESH_TOKEN_SECRET);
};
