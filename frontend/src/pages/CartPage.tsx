import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  useCart,
  useRemoveCartItem,
  useUpsertCartItem,
} from "../features/cart/cartHooks";
import { useCreateCheckoutSession } from "../features/payment/paymentHooks";
import { useProfile } from "../features/profile/profileHooks";
import type { ConsumerProfile } from "../types/api";
import { EmptyState } from "../components/EmptyState";
import { Loader } from "../components/Loader";
import { Search } from "lucide-react";
import { Pagination } from "../components/Pagination";
import { useClientFilter } from "../hooks/useClientFilter";

const phoneRegex = /^[0-9]{7,15}$/;

export const CartPage = () => {
  const cartQuery = useCart();
  const profileQuery = useProfile();
  const removeItem = useRemoveCartItem();
  const upsertItem = useUpsertCartItem();
  const checkoutSession = useCreateCheckoutSession();

  const [selectedDeliveryIndex, setSelectedDeliveryIndex] =
    useState<string>("");
  const [recipientName, setRecipientName] = useState("");
  const [address, setAddress] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [alternateNumber, setAlternateNumber] = useState("");
  const consumerProfile =
    profileQuery.data?.role === "consumer"
      ? (profileQuery.data.profile as ConsumerProfile | null)
      : null;
  const deliveryContacts = consumerProfile?.deliveryContacts ?? [];

  useEffect(() => {
    if (!consumerProfile) {
      return;
    }

    if (mobileNumber.trim().length === 0) {
      setMobileNumber(consumerProfile.mobileNumber ?? "");
    }

    if (alternateNumber.trim().length === 0) {
      setAlternateNumber(consumerProfile.alternateNumber ?? "");
    }
  }, [consumerProfile, mobileNumber, alternateNumber]);

  const lines = cartQuery.data ?? [];
  const total = lines.reduce(
    (sum, line) => sum + (line.product?.price ?? 0) * line.quantity,
    0,
  );

  const cartList = useClientFilter({
    data: lines,
    searchFields: [(line) => line.product?.title || line.productId],
  });
  const pagedLines = cartList.paginate(cartList.filteredData);

  if (cartQuery.isLoading || profileQuery.isLoading) {
    return <Loader label="Loading cart..." />;
  }

  if (lines.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add items from the products page."
      />
    );
  }

  const onSelectSavedContact = (indexValue: string): void => {
    setSelectedDeliveryIndex(indexValue);

    if (indexValue === "") {
      return;
    }

    const contact = deliveryContacts[Number(indexValue)];
    if (!contact) {
      return;
    }

    setRecipientName(contact.recipientName);
    setAddress(contact.address);
  };

  const onPayWithStripe = async (): Promise<void> => {
    if (recipientName.trim().length < 2) {
      toast.error("Please enter recipient name");
      return;
    }

    if (address.trim().length < 5) {
      toast.error("Please enter a valid address");
      return;
    }

    if (!phoneRegex.test(mobileNumber)) {
      toast.error("Enter a valid mobile number (7-15 digits)");
      return;
    }

    if (alternateNumber && !phoneRegex.test(alternateNumber)) {
      toast.error("Enter a valid alternate number (7-15 digits)");
      return;
    }

    try {
      const result = await checkoutSession.mutateAsync({
        shippingDetails: {
          recipientName: recipientName.trim(),
          address: address.trim(),
          mobileNumber: mobileNumber.trim(),
          ...(alternateNumber.trim().length > 0
            ? { alternateNumber: alternateNumber.trim() }
            : {}),
        },
      });

      // Redirect to Stripe Checkout
      if (result.sessionUrl) {
        window.location.href = result.sessionUrl;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch {
      toast.error("Payment initialization failed");
    }
  };

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search cart..."
            className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-brand-600 focus:ring-1 focus:ring-brand-600 w-full sm:w-64"
            value={cartList.search}
            onChange={(e) => {
              cartList.setSearch(e.target.value);
              cartList.setPage(1);
            }}
          />
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {pagedLines.map((line) => (
          <div
            key={line.productId}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
          >
            <div>
              <p className="font-semibold">
                {line.product?.title ?? line.productId}
              </p>
              <p className="text-sm text-slate-500">
                ${(line.product?.price ?? 0).toFixed(2)} each
              </p>
              <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                <span>Qty:</span>
                <button
                  type="button"
                  className="rounded border border-slate-300 px-2"
                  disabled={line.quantity <= 1 || upsertItem.isPending}
                  onClick={async () => {
                    try {
                      await upsertItem.mutateAsync({
                        productId: line.productId,
                        quantity: line.quantity - 1,
                      });
                    } catch (error: any) {
                      toast.error(
                        error.response?.data?.message ||
                          "Quantity update failed",
                      );
                    }
                  }}
                >
                  -
                </button>
                <span className="min-w-6 text-center font-medium">
                  {line.quantity}
                </span>
                <button
                  type="button"
                  className="rounded border border-slate-300 px-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    upsertItem.isPending ||
                    (line.product?.stock !== undefined &&
                      line.quantity >= line.product.stock)
                  }
                  onClick={async () => {
                    try {
                      await upsertItem.mutateAsync({
                        productId: line.productId,
                        quantity: line.quantity + 1,
                      });
                    } catch (error: any) {
                      toast.error(
                        error.response?.data?.message ||
                          "Quantity update failed",
                      );
                    }
                  }}
                >
                  +
                </button>
                <span className="ml-4 text-xs font-medium">
                  {line.product?.stock === 0 ? (
                    <span className="text-red-500 uppercase tracking-tighter">
                      Out of Stock
                    </span>
                  ) : line.product?.stock !== undefined &&
                    line.product.stock <= 5 ? (
                    <span className="text-amber-600">
                      Only {line.product.stock} left
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      {line.product?.stock} in stock
                    </span>
                  )}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="font-semibold text-brand-700">
                ${((line.product?.price ?? 0) * line.quantity).toFixed(2)}
              </p>
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 transition"
                onClick={async () => {
                  try {
                    await removeItem.mutateAsync(line.productId);
                  } catch {
                    toast.error("Remove failed");
                  }
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        {cartList.filteredData.length === 0 && (
          <div className="py-8 text-center text-slate-500">
            <p>No items match your search.</p>
          </div>
        )}
      </div>
      <Pagination
        currentPage={cartList.page}
        totalItems={cartList.filteredData.length}
        pageSize={cartList.itemsPerPage}
        onPageChange={cartList.setPage}
      />

      <div className="mt-6 rounded-xl border border-brand-100 bg-white p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <p className="text-lg font-bold">Order Total</p>
          <p className="text-2xl font-extrabold bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
            ${total.toFixed(2)}
          </p>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label
              htmlFor="saved-delivery-contact"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Saved Name + Address (Optional)
            </label>
            <select
              id="saved-delivery-contact"
              name="savedDeliveryContact"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              value={selectedDeliveryIndex}
              onChange={(event) => onSelectSavedContact(event.target.value)}
            >
              <option value="">Select saved contact</option>
              {deliveryContacts.map((entry, index) => (
                <option
                  key={`${entry.recipientName}-${entry.address}-${index}`}
                  value={index}
                >
                  {entry.recipientName} - {entry.address}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="order-recipient-name"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Name
            </label>
            <input
              id="order-recipient-name"
              name="recipientName"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label
              htmlFor="order-address"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Address
            </label>
            <textarea
              id="order-address"
              name="address"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              rows={3}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="12 Main Street, NY"
              required
            />
          </div>

          <div>
            <label
              htmlFor="order-mobile-number"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Personal Mobile Number
            </label>
            <input
              id="order-mobile-number"
              name="mobileNumber"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              value={mobileNumber}
              onChange={(event) => setMobileNumber(event.target.value)}
              placeholder="9876543210"
              required
            />
          </div>

          <div>
            <label
              htmlFor="order-alternate-number"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Alternate Number
            </label>
            <input
              id="order-alternate-number"
              name="alternateNumber"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              value={alternateNumber}
              onChange={(event) => setAlternateNumber(event.target.value)}
              placeholder="9123456780"
            />
          </div>
        </div>

        {/* Stripe Payment Button */}
        <button
          type="button"
          className="mt-5 flex w-full items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={checkoutSession.isPending}
          onClick={onPayWithStripe}
        >
          {checkoutSession.isPending ? (
            <>
              <svg
                className="h-5 w-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Redirecting to payment...
            </>
          ) : (
            <>
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              Pay ${total.toFixed(2)} with Stripe
            </>
          )}
        </button>

        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400">
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          Secured by Stripe • 256-bit SSL encryption
        </div>
      </div>
    </section>
  );
};
