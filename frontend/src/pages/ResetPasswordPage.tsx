import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useResetPassword } from "../features/auth/authHooks";
import { Lock, Mail, KeyRound, ArrowRight } from "lucide-react";

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
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Reset failed");
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

          <form onSubmit={onSubmit} className="space-y-6">
            {!searchParams.get("email") && (
              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-sm font-medium leading-6 text-slate-900"
                >
                  Email address
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="reset-email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-700 sm:text-sm sm:leading-6"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            )}

            {!searchParams.get("token") && (
              <div>
                <label
                  htmlFor="reset-token"
                  className="block text-sm font-medium leading-6 text-slate-900"
                >
                  Reset Token
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <KeyRound className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="reset-token"
                    name="token"
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-700 sm:text-sm sm:leading-6"
                    placeholder="Paste your reset token"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="reset-new-password"
                className="block text-sm font-medium leading-6 text-slate-900"
              >
                New Password
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="reset-new-password"
                  name="newPassword"
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-700 sm:text-sm sm:leading-6"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reset-confirm-password"
                className="block text-sm font-medium leading-6 text-slate-900"
              >
                Confirm New Password
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="reset-confirm-password"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-700 sm:text-sm sm:leading-6"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={reset.isPending}
              className="flex w-full justify-center rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:opacity-70  transition-all active:scale-[0.98]"
            >
              {reset.isPending ? (
                "Resetting..."
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform " />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-600">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-semibold text-brand-700  transition-colors"
            >
              Go to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
