import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { JwtPayloadBase } from "../types/auth.types.js";

export interface AccessTokenPayload extends JwtPayloadBase {
  type: "access";
}

export interface RefreshTokenPayload extends JwtPayloadBase {
  type: "refresh";
  tokenId: string;
}

export const signAccessToken = (payload: JwtPayloadBase): string => {
  const accessPayload: AccessTokenPayload = { ...payload, type: "access" };
  const expiresIn = env.ACCESS_TOKEN_EXPIRES_IN as NonNullable<jwt.SignOptions["expiresIn"]>;
  return jwt.sign(accessPayload, env.ACCESS_TOKEN_SECRET, {
    expiresIn
  });
};

export const signRefreshToken = (payload: JwtPayloadBase & { tokenId: string }): string => {
  const refreshPayload: RefreshTokenPayload = { ...payload, type: "refresh" };
  const expiresIn = env.REFRESH_TOKEN_EXPIRES_IN as NonNullable<jwt.SignOptions["expiresIn"]>;
  return jwt.sign(refreshPayload, env.REFRESH_TOKEN_SECRET, {
    expiresIn
  });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
};
