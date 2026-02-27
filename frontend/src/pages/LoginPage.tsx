import { type FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { useLogin, useGoogleLogin } from "../features/auth/authHooks";
import { LogIn } from "lucide-react";
import { LoginForm } from "../components/Auth/LoginForm";
import { GoogleLogin } from "@react-oauth/google";
import { RoleSelection } from "../components/Auth/RoleSelection";
import type { UserRole } from "../types/api";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [googleAuthResponse, setGoogleAuthResponse] = useState<any>(null);

  const login = useLogin();
  const googleLogin = useGoogleLogin();
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";

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

  const onGoogleSuccess = async (response: any) => {
    try {
      const result = await googleLogin.mutateAsync({
        idToken: response.credential,
      });
      if ("needsRole" in result) {
        // New user — show role selection screen
        setGoogleAuthResponse(response);
        setRole("");
      } else {
        navigate(from, { replace: true });
      }
    } catch {
      toast.error("Google login failed");
    }
  };

  const onConfirmGoogleRole = async () => {
    if (!role || !googleAuthResponse) return;

    try {
      await googleLogin.mutateAsync({
        idToken: googleAuthResponse.credential,
        role: role as string,
      });
      navigate(from, { replace: true });
    } catch (error) {
      toast.error("Failed to complete setup");
      setGoogleAuthResponse(null);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white ring-1 ring-slate-900/5 sm:rounded-3xl">
        <div className="p-8 sm:p-10">
          {!googleAuthResponse ? (
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
                  <GoogleLogin
                    onSuccess={onGoogleSuccess}
                    onError={() => toast.error("Google login failed")}
                    useOneTap
                    theme="outline"
                    shape="pill"
                  />
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
