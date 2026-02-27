import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { authApi } from "./authAPI";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { clearUser, setUser } from "./authSlice";
import type {
  AuthPayload,
  ForgotPasswordPayload,
  LoginPayload,
  ResetPasswordPayload,
  VerifyEmailPayload,
} from "../../types/api";

const meQueryKey = ["auth", "me"] as const;

export const useAuthBootstrap = () => {
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: meQueryKey,
    queryFn: async () => {
      try {
        const me = await authApi.me();
        if (me) {
          dispatch(setUser(me));
          return me;
        }

        const refreshed = await authApi.refresh();
        if (refreshed) {
          dispatch(setUser(refreshed));
          return refreshed;
        }

        dispatch(clearUser());
        return null;
      } catch {
        dispatch(clearUser());
        return null;
      }
    },
    staleTime: 30_000,
    retry: false,
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (payload: AuthPayload) => authApi.register(payload),
    onSuccess: () => {
      toast.success("Account created. Check your email to verify.");
    },
  });
};

export const useLogin = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (user) => {
      dispatch(setUser(user));
      queryClient.setQueryData(meQueryKey, user);
      toast.success("Logged in successfully");
    },
  });
};

export const useGoogleLogin = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { idToken: string; role?: string }) =>
      authApi.googleLogin(payload),
    onSuccess: (result) => {
      // Only update auth state when a real user is returned (not needsRole signal)
      if (!("needsRole" in result)) {
        dispatch(setUser(result));
        queryClient.setQueryData(meQueryKey, result);
        toast.success("Logged in with Google");
      }
    },
  });
};

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      dispatch(clearUser());
      queryClient.setQueryData(meQueryKey, null);
      toast.success("Logged out");
    },
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (payload: VerifyEmailPayload) => authApi.verifyEmail(payload),
    onSuccess: () => {
      toast.success("Email verified. You can now login.");
    },
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.resendVerification(email),
    onSuccess: () => {
      toast.success("Verification email sent if account exists.");
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) =>
      authApi.forgotPassword(payload),
    onSuccess: () => {
      toast.success("Reset email sent if account exists.");
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) =>
      authApi.resetPassword(payload),
    onSuccess: () => {
      toast.success("Password reset successful.");
    },
  });
};

export const useAuthState = () => useAppSelector((state) => state.auth);
