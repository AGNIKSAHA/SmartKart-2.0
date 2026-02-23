import toast from "react-hot-toast";
import { useAuthState } from "../features/auth/authHooks";
import { useUpsertCartItem } from "../features/cart/cartHooks";
import { useProfile } from "../features/profile/profileHooks";
import type { ConsumerProfile } from "../types/api";

interface AddToCartButtonProps {
  productId: string;
  className: string;
  stock?: number;
}

export const AddToCartButton = ({
  productId,
  className,
  stock,
}: AddToCartButtonProps) => {
  const { user } = useAuthState();
  const profileQuery = useProfile(user?.role === "consumer");
  const upsertCart = useUpsertCartItem();

  const consumerProfile =
    profileQuery.data?.role === "consumer" && profileQuery.data.profile
      ? (profileQuery.data.profile as ConsumerProfile)
      : null;

  const isConsumerProfileComplete =
    consumerProfile !== null &&
    consumerProfile.fullName.trim().length > 0 &&
    consumerProfile.mobileNumber.trim().length > 0 &&
    consumerProfile.deliveryContacts.length > 0;

  const isOutOfStock = stock !== undefined && stock <= 0;
  const isShopkeeper = user?.role === "shopkeeper";
  const isDisabled = isShopkeeper || isOutOfStock;

  const label = isShopkeeper
    ? "Consumers Only"
    : isOutOfStock
      ? "Out of Stock"
      : "Add to Cart";

  return (
    <button
      type="button"
      className={`${className} ${isOutOfStock ? "cursor-not-allowed opacity-50" : ""}`}
      disabled={isDisabled}
      onClick={async () => {
        if (user?.role === "consumer" && !isConsumerProfileComplete) {
          toast.error("profile incomplete");
          return;
        }

        try {
          await upsertCart.mutateAsync({ productId, quantity: 1 });
        } catch {
          toast.error("Add to cart failed");
        }
      }}
    >
      {label}
    </button>
  );
};
