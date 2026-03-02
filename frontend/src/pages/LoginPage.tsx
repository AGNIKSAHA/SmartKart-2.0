import { type FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { useLogin, useGoogleLogin } from "../features/auth/authHooks";
import { useGoogleLogin as useGoogleOAuthLogin } from "@react-oauth/google";
import { LogIn } from "lucide-react";
import { LoginForm } from "../components/Auth/LoginForm";
import { RoleSelection } from "../components/Auth/RoleSelection";
import type { UserRole } from "../types/api";

// Google "G" logo SVG — matches brand guidelines
const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="h-5 w-5"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [googleTokenResponse, setGoogleTokenResponse] = useState<{
    access_token: string;
  } | null>(null);

  const login = useLogin();
  const googleLogin = useGoogleLogin();
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";

  // prompt: 'select_account' forces Google to always issue a fresh token.
  // Without it, the GIS library caches the previous access_token and reuses
  // it on re-login — after logout the cached token is expired, causing 401.
  const handleGoogleLogin = useGoogleOAuthLogin({
    onSuccess: (tokenResponse) => {
      onGoogleSuccess({ access_token: tokenResponse.access_token });
    },
    onError: () => toast.error("Google login failed"),
    prompt: "select_account",
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await login.mutateAsync({ email, password });
      navigate(from, { replace: true });
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Login failed");
      } else {
        toast.error("Login failed");
      }
    }
  };

  const onGoogleSuccess = async (response: { access_token: string }) => {
    try {
      const result = await googleLogin.mutateAsync({
        accessToken: response.access_token,
      });
      if ("needsRole" in result) {
        // New user — show role selection screen
        setGoogleTokenResponse(response);
        setRole("");
      } else {
        navigate(from, { replace: true });
      }
    } catch {
      toast.error("Google login failed");
    }
  };

  const onConfirmGoogleRole = async () => {
    if (!role || !googleTokenResponse) return;

    try {
      await googleLogin.mutateAsync({
        accessToken: googleTokenResponse.access_token,
        role: role as string,
      });
      navigate(from, { replace: true });
    } catch {
      toast.error("Failed to complete setup");
      setGoogleTokenResponse(null);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white ring-1 ring-slate-900/5 sm:rounded-3xl">
        <div className="p-8 sm:p-10">
          {!googleTokenResponse ? (
            <>
              <div className="mb-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <LogIn className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Welcome back
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Please enter your details to sign in.
                </p>
              </div>

              <LoginForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                onSubmit={onSubmit}
                isPending={login.isPending || googleLogin.isPending}
              />

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-sm leading-6">
                    <span className="bg-white px-4 text-slate-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    id="google-login-btn"
                    onClick={() => handleGoogleLogin()}
                    disabled={googleLogin.isPending}
                    className="flex items-center justify-center gap-3 rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <GoogleIcon />
                    Sign in with Google
                  </button>
                </div>
              </div>

              <div className="mt-8 text-center text-sm text-slate-600 space-y-2 flex flex-col items-center">
                <div>
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-brand-700 hover:text-brand-800 transition-colors"
                  >
                    Sign up
                  </Link>
                </div>

                <div className="text-xs text-slate-400 pt-2 border-t border-slate-100 w-3/4">
                  Need to verify your email?{" "}
                  <Link
                    to="/verify-email"
                    className="font-semibold text-brand-500 hover:text-brand-700 transition-colors"
                  >
                    Click here
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <RoleSelection
              selectedRole={role}
              onSelect={(r) => setRole(r)}
              onConfirm={onConfirmGoogleRole}
              isPending={googleLogin.isPending}
            />
          )}
        </div>
      </div>
    </div>
  );
};
