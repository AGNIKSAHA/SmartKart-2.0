import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useForgotPassword } from "../features/auth/authHooks";
import { KeyRound, Mail, ArrowRight } from "lucide-react";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const forgot = useForgotPassword();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await forgot.mutateAsync({ email });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Request failed");
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

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="forgot-email"
                className="block text-sm font-medium leading-6 text-slate-900"
              >
                Email address
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-700 sm:text-sm sm:leading-6"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={forgot.isPending}
              className="flex w-full justify-center rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:opacity-70  transition-all active:scale-[0.98]"
            >
              {forgot.isPending ? (
                "Sending..."
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform " />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-600 flex flex-col items-center space-y-2">
            <div>
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-semibold text-brand-700  transition-colors"
              >
                Go to login
              </Link>
            </div>

            <div className="text-xs text-slate-400 pt-2 border-t border-slate-100 w-3/4">
              Already have a reset token?{" "}
              <Link
                to="/reset-password"
                className="font-semibold text-brand-500 hover:text-brand-700"
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
