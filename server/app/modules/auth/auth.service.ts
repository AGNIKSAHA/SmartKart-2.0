import bcrypt from "bcryptjs";
import { env } from "../../common/config/env.js";
import type { UserRole } from "../../common/types/auth.types.js";
import type { UserEntity } from "../../common/types/domain.types.js";
import { AppError } from "../../common/middleware/error.middleware.js";
import { sendEmail } from "../../common/utils/mail.js";
import { sha256, generateToken } from "../../common/utils/hash.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../common/utils/jwt.js";
import { durationToMs } from "../../common/utils/time.js";
import { createId } from "../../common/utils/id.js";
import { tokenStore } from "../token/token.store.js";
import { userStore } from "../user/user.store.js";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface LoginInput {
  email: string;
  password: string;
}

interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  accessMaxAgeMs: number;
  refreshMaxAgeMs: number;
}

interface AuthUserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  isEmailVerified: boolean;
}

interface AuthResult {
  user: AuthUserResponse;
  tokens: SessionTokens;
}

const toSafeUser = (user: UserEntity): AuthUserResponse => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  isEmailVerified: user.isEmailVerified
});

const createSessionTokens = async (user: UserEntity): Promise<SessionTokens> => {
  const tokenId = createId();
  const refreshMaxAgeMs = durationToMs(env.REFRESH_TOKEN_EXPIRES_IN);
  const accessMaxAgeMs = durationToMs(env.ACCESS_TOKEN_EXPIRES_IN);

  await tokenStore.save({
    id: tokenId,
    userId: user.id,
    expiresAt: Date.now() + refreshMaxAgeMs,
    revoked: false
  });

  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    email: user.email
  });

  const refreshToken = signRefreshToken({
    sub: user.id,
    role: user.role,
    email: user.email,
    tokenId
  });

  return {
    accessToken,
    refreshToken,
    accessMaxAgeMs,
    refreshMaxAgeMs
  };
};

const sendVerificationEmail = async (user: UserEntity): Promise<void> => {
  const token = generateToken();
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await userStore.setEmailVerificationToken(user.id, tokenHash, expiresAt);

  const verifyLink = `${env.CORS_ORIGIN}/verify-email?email=${encodeURIComponent(user.email)}&token=${token}`;

  await sendEmail({
    to: user.email,
    subject: "Verify your email",
    text: `Verify your account with this link: ${verifyLink}`
  });
};

export const authService = {
  async register(input: RegisterInput): Promise<{ user: AuthUserResponse }> {
    const existing = await userStore.findByEmail(input.email);
    if (existing) {
      throw new AppError("Email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await userStore.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      isEmailVerified: false
    });

    await sendVerificationEmail(user);

    return { user: toSafeUser(user) };
  },

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await userStore.findByEmail(input.email);
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const validPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!validPassword) {
      throw new AppError("Invalid credentials", 401);
    }

    if (!user.isEmailVerified) {
      throw new AppError("Please verify your email before login", 403);
    }

    return { user: toSafeUser(user), tokens: await createSessionTokens(user) };
  },

  async refreshSession(refreshToken: string): Promise<AuthResult> {
    let payload: ReturnType<typeof verifyRefreshToken>;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError("Invalid refresh token", 401);
    }

    const tokenRecord = await tokenStore.findById(payload.tokenId);
    if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < Date.now()) {
      throw new AppError("Refresh token expired or revoked", 401);
    }

    await tokenStore.revokeById(payload.tokenId);

    const user = await userStore.findById(payload.sub);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    return { user: toSafeUser(user), tokens: await createSessionTokens(user) };
  },

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken);
        await tokenStore.revokeById(payload.tokenId);
      } catch {
        await tokenStore.revokeByUserId(userId);
      }
      return;
    }

    await tokenStore.revokeByUserId(userId);
  },

  async verifyEmail(email: string, token: string): Promise<void> {
    const ok = await userStore.verifyEmail(email, sha256(token));
    if (!ok) {
      throw new AppError("Invalid or expired verification token", 400);
    }
  },

  async resendVerification(email: string): Promise<void> {
    const user = await userStore.findByEmail(email);
    if (!user) {
      return;
    }

    if (user.isEmailVerified) {
      return;
    }

    await sendVerificationEmail(user);
  },

  async forgotPassword(email: string): Promise<void> {
    const user = await userStore.findByEmail(email);
    if (!user || !user.isEmailVerified) {
      return;
    }

    const token = generateToken();
    const tokenHash = sha256(token);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const updated = await userStore.setPasswordResetToken(user.email, tokenHash, expiresAt);
    if (!updated) {
      return;
    }

    const resetLink = `${env.CORS_ORIGIN}/reset-password?email=${encodeURIComponent(user.email)}&token=${token}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      text: `Reset your password with this link: ${resetLink}`
    });
  },

  async resetPassword(email: string, token: string, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const ok = await userStore.resetPassword(email, sha256(token), passwordHash);
    if (!ok) {
      throw new AppError("Invalid or expired reset token", 400);
    }
  }
};
