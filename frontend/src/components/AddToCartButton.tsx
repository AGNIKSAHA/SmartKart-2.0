import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { useAuthState } from "../features/auth/authHooks";
import { useUpsertCartItem, useCart } from "../features/cart/cartHooks";
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

  const { data: cartItems } = useCart(!isShopkeeper);

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

        const existingItem = cartItems?.find((i) => i.productId === productId);
        const newQuantity = (existingItem?.quantity ?? 0) + 1;

        if (stock !== undefined && newQuantity > stock) {
          toast.error("Quantity exceeds available stock");
          return;
        }

        try {
          await upsertCart.mutateAsync({ productId, quantity: newQuantity });
          toast.success("Added to cart");
        } catch (error) {
          if (isAxiosError(error)) {
            toast.error(error.response?.data?.message || "Add to cart failed");
          } else {
            toast.error("Add to cart failed");
          }
        }
      }}
    >
      {label}
    </button>
  );
};
