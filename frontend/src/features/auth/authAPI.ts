import { http } from "../../utils/http";
import { unwrap } from "../../utils/request";
import type {
  AuthPayload,
  ForgotPasswordPayload,
  LoginPayload,
  ResetPasswordPayload,
  User,
  VerifyEmailPayload
} from "../../types/api";

export const authApi = {
  register(payload: AuthPayload): Promise<User> {
    return unwrap(http.post("/auth/register", payload));
  },
  login(payload: LoginPayload): Promise<User> {
    return unwrap(http.post("/auth/login", payload));
  },
  me(): Promise<User> {
    return unwrap(http.get("/auth/me"));
  },
  refresh(): Promise<User> {
    return unwrap(http.post("/auth/refresh"));
  },
  logout(): Promise<null> {
    return unwrap(http.post("/auth/logout"));
  },
  verifyEmail(payload: VerifyEmailPayload): Promise<null> {
    return unwrap(http.post("/auth/verify-email", payload));
  },
  resendVerification(email: string): Promise<null> {
    return unwrap(http.post("/auth/resend-verification", { email }));
  },
  forgotPassword(payload: ForgotPasswordPayload): Promise<null> {
    return unwrap(http.post("/auth/forgot-password", payload));
  },
  resetPassword(payload: ResetPasswordPayload): Promise<null> {
    return unwrap(http.post("/auth/reset-password", payload));
  }
};
