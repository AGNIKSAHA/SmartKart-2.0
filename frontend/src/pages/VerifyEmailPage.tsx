import { type FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useResendVerification,
  useVerifyEmail,
} from "../features/auth/authHooks";
import { Mail, ArrowRight, Loader2, CheckCircle, XCircle } from "lucide-react";

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const verifyEmail = useVerifyEmail();
  const resend = useResendVerification();
  const autoVerifiedRef = useRef(false);

  const qpEmail = searchParams.get("email");
  const qpToken = searchParams.get("token");
  const isAutoVerifying = !!(qpEmail && qpToken);

  useEffect(() => {
    if (autoVerifiedRef.current || !isAutoVerifying) {
      return;
    }
    autoVerifiedRef.current = true;
    verifyEmail.mutate({ email: qpEmail, token: qpToken });
  }, [searchParams, isAutoVerifying, qpEmail, qpToken, verifyEmail]);

  useEffect(() => {
    if (verifyEmail.isSuccess) {
      toast.success("Email verified successfully! Please log in.");
      navigate("/login", { replace: true });
    }
  }, [verifyEmail.isSuccess, navigate]);

  const onResend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) return;
    try {
      await resend.mutateAsync(email);
      setEmail("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Resend failed");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5 sm:rounded-3xl">
        <div className="p-8 sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-700">
              {isAutoVerifying ? (
                verifyEmail.isError ? (
                  <XCircle className="h-8 w-8 text-red-500" />
                ) : (
                  <Loader2 className="h-8 w-8 animate-spin" />
                )
              ) : (
                <Mail className="h-8 w-8" />
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {isAutoVerifying
                ? verifyEmail.isError
                  ? "Verification Failed"
                  : "Verifying your email"
                : "Verify your email"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {isAutoVerifying
                ? verifyEmail.isError
                  ? "The link may be expired or invalid. Please request a new one below."
                  : "Please wait while we securely verify your email address..."
                : "Didn't receive the email? Enter your address to request a new verification link."}
            </p>
          </div>

          {!isAutoVerifying || verifyEmail.isError ? (
            <form onSubmit={onResend} className="space-y-6">
              <div>
                <label
                  htmlFor="verify-email"
                  className="block text-sm font-medium leading-6 text-slate-900"
                >
                  Email address
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="verify-email"
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
                disabled={resend.isPending || !email.trim()}
                className="flex w-full justify-center rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:opacity-70  transition-all active:scale-[0.98]"
              >
                {resend.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  <>
                    Send verification link
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform " />
                  </>
                )}
              </button>
            </form>
          ) : null}

          <div className="mt-8 text-center text-sm text-slate-600">
            Ready to sign in?{" "}
            <Link
              to="/login"
              className="font-semibold text-brand-700  transition-colors"
            >
              Go to login &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
