import { useCart } from "../features/cart/cartHooks";
import { useProfile } from "../features/profile/profileHooks";
import { EmptyState } from "../components/EmptyState";
import { Loader } from "../components/Loader";
import { useClientFilter } from "../hooks/useClientFilter";

import { CartList } from "../components/Cart/CartList";
import { CartCheckout } from "../components/Cart/CartCheckout";

export const CartPage = () => {
  const cartQuery = useCart();
  const profileQuery = useProfile();

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

  return (
    <section>
      <CartList cartList={cartList} pagedLines={pagedLines} />
      <CartCheckout total={total} />
    </section>
  );
};
