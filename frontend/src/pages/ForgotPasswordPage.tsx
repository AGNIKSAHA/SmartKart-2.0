import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { useForgotPassword } from "../features/auth/authHooks";
import { KeyRound } from "lucide-react";
import { ForgotPasswordForm } from "../components/Auth/ForgotPasswordForm";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const forgot = useForgotPassword();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await forgot.mutateAsync({ email });
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Request failed");
      } else {
        toast.error("Request failed");
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
              Forgot Password
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          </div>

          <ForgotPasswordForm
            email={email}
            setEmail={setEmail}
            onSubmit={onSubmit}
            isPending={forgot.isPending}
          />

          <div className="mt-8 text-center text-sm text-slate-600 flex flex-col items-center space-y-2">
            <div>
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-semibold text-brand-700 hover:text-brand-800 transition-colors"
              >
                Go to login
              </Link>
            </div>

            <div className="text-xs text-slate-400 pt-2 border-t border-slate-100 w-3/4">
              Already have a reset token?{" "}
              <Link
                to="/reset-password"
                className="font-semibold text-brand-500 hover:text-brand-700 transition-colors"
              >
                Enter it here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
