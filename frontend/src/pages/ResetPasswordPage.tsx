import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { useResetPassword } from "../features/auth/authHooks";
import { KeyRound } from "lucide-react";
import { ResetPasswordForm } from "../components/Auth/ResetPasswordForm";

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const reset = useResetPassword();
  const navigate = useNavigate();

  useEffect(() => {
    const queryToken = searchParams.get("token");
    const queryEmail = searchParams.get("email");
    if (queryToken) setToken(queryToken);
    if (queryEmail) setEmail(queryEmail);
  }, [searchParams]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Password and confirm password do not match");
      return;
    }

    try {
      await reset.mutateAsync({ email, token, newPassword });
      toast.success("Password reset successfully. Please log in.");
      navigate("/login", { replace: true });
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Reset failed");
      } else {
        toast.error("Reset failed");
      }
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5 sm:rounded-3xl">
        <div className="p-8 sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-700">
              <KeyRound className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Set new password
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Enter your new password below to regain access.
            </p>
          </div>

          <ResetPasswordForm
            email={email}
            setEmail={setEmail}
            token={token}
            setToken={setToken}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showEmailField={!searchParams.get("email")}
            showTokenField={!searchParams.get("token")}
            onSubmit={onSubmit}
            isPending={reset.isPending}
          />

          <div className="mt-8 text-center text-sm text-slate-600">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-semibold text-brand-700 hover:text-brand-800 transition-colors"
            >
              Go to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
