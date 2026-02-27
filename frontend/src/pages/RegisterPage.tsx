import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { useRegister, useGoogleLogin } from "../features/auth/authHooks";
import type { UserRole } from "../types/api";
import { UserPlus } from "lucide-react";
import { RegisterForm } from "../components/Auth/RegisterForm";
import { GoogleLogin } from "@react-oauth/google";
import { RoleSelection } from "../components/Auth/RoleSelection";

export const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [googleAuthResponse, setGoogleAuthResponse] = useState<any>(null);

  const register = useRegister();
  const googleLogin = useGoogleLogin();
  const navigate = useNavigate();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Password and confirm password do not match");
      return;
    }
    if (!role) {
      toast.error("Please select a role");
      return;
    }

    try {
      await register.mutateAsync({ name, email, password, role });
      navigate("/login", { replace: true });
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Registration failed");
      } else {
        toast.error("Registration failed");
      }
    }
  };

  const onGoogleSuccess = (response: any) => {
    // Stage 1: Google Auth Complete, store response and show role selector
    setGoogleAuthResponse(response);
    // Reset role if it was selected in the form, to ensure they choose deliberately
    setRole("");
  };

  const onConfirmGoogleRole = async () => {
    if (!role || !googleAuthResponse) return;

    try {
      await googleLogin.mutateAsync({
        idToken: googleAuthResponse.credential,
        role: role as string,
      });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error("Google registration failed");
      setGoogleAuthResponse(null); // Reset to allow retry
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
                  <UserPlus className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Create an account
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Join us to start your journey.
                </p>
              </div>

              <RegisterForm
                name={name}
                setName={setName}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                role={role}
                setRole={setRole}
                onSubmit={onSubmit}
                isPending={register.isPending || googleLogin.isPending}
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
