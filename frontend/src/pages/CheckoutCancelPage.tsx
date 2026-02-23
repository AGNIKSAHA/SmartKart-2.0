import { useSearchParams, Link } from "react-router-dom";

export const CheckoutCancelPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-10 text-center shadow-xl">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h1 className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-3xl font-extrabold text-transparent">
          Payment Cancelled
        </h1>

        <p className="mt-3 text-lg text-slate-600">
          Your payment was cancelled. Don't worry, no charges were made.
        </p>

        {orderId && (
          <div className="mt-4 rounded-lg bg-white/70 px-4 py-3 shadow-inner">
            <p className="text-sm text-slate-500">
              Your order{" "}
              <span className="font-mono font-bold text-slate-700">
                {orderId}
              </span>{" "}
              is still pending. You can try again from your cart.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/cart"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 font-semibold text-white shadow-md transition hover:from-amber-600 hover:to-orange-600 hover:shadow-lg"
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
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
              />
            </svg>
            Return to Cart
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-2.5 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </section>
  );
};
