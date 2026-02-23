import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useSessionStatus } from "../features/payment/paymentHooks";
import { Loader } from "../components/Loader";

export const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { data, isLoading, isError } = useSessionStatus(sessionId);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loader label="Verifying payment..." />;
  }

  if (isError || !data) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="mx-auto max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-700">
            Verification Failed
          </h1>
          <p className="mt-2 text-red-600">
            We couldn't verify your payment. Please contact support.
          </p>
          <Link
            to="/dashboard"
            className="mt-6 inline-block rounded-lg bg-red-600 px-6 py-2.5 font-medium text-white transition hover:bg-red-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center">
      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1.5 + Math.random() * 2}s`,
                fontSize: `${12 + Math.random() * 16}px`,
                opacity: 0.8,
              }}
            >
              {["🎉", "✨", "🎊", "💫", "⭐"][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      <div className="mx-auto max-w-lg rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-10 text-center shadow-xl">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg">
          <svg
            className="h-10 w-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-3xl font-extrabold text-transparent">
          Payment Successful!
        </h1>

        <p className="mt-3 text-lg text-slate-600">
          Your order has been placed and payment confirmed.
        </p>

        {data.orderId && (
          <div className="mt-4 rounded-lg bg-white/70 px-4 py-3 shadow-inner">
            <p className="text-sm font-medium text-slate-500">Order ID</p>
            <p className="mt-0.5 font-mono text-sm font-bold text-slate-700">
              {data.orderId}
            </p>
          </div>
        )}

        {data.customerEmail && (
          <p className="mt-3 text-sm text-slate-500">
            A confirmation email has been sent to{" "}
            <strong className="text-slate-700">{data.customerEmail}</strong>.
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-2.5 font-semibold text-white shadow-md transition hover:from-green-600 hover:to-emerald-600 hover:shadow-lg"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
            View My Orders
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-2.5 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
};
