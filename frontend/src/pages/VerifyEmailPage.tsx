import { type FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import {
  useResendVerification,
  useVerifyEmail,
} from "../features/auth/authHooks";
import { Mail, Loader2, CheckCircle, XCircle } from "lucide-react";
import { VerifyEmailForm } from "../components/Auth/VerifyEmailForm";

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
      const timer = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [verifyEmail.isSuccess, navigate]);

  const onResend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) return;
    try {
      await resend.mutateAsync(email);
      setEmail("");
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Resend failed");
      } else {
        toast.error("Resend failed");
      }
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white ring-1 ring-slate-900/5 sm:rounded-3xl">
        <div className="p-8 sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-700">
              {isAutoVerifying ? (
                verifyEmail.isSuccess ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : verifyEmail.isError ? (
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
                ? verifyEmail.isSuccess
                  ? "Email Verified!"
                  : verifyEmail.isError
                    ? "Verification Failed"
                    : "Verifying your email"
                : "Verify your email"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {isAutoVerifying
                ? verifyEmail.isSuccess
                  ? "Your email has been successfully verified. Redirection to login..."
                  : verifyEmail.isError
                    ? "The link may be expired or invalid. Please request a new one below."
                    : "Please wait while we securely verify your email address..."
                : "Didn't receive the email? Enter your address to request a new verification link."}
            </p>
          </div>

          {!isAutoVerifying || verifyEmail.isError ? (
            <VerifyEmailForm
              email={email}
              setEmail={setEmail}
              onSubmit={onResend}
              isPending={resend.isPending}
            />
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
