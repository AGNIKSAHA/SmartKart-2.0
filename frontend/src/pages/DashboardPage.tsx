import { useAuthState } from "../features/auth/authHooks";
import { useProfile } from "../features/profile/profileHooks";
import { useOrders } from "../features/orders/orderHooks";
import { useMyProducts } from "../features/products/productHooks";
import { Loader } from "../components/Loader";

import { DashboardWelcome } from "../components/Dashboard/DashboardWelcome";
import { DashboardOrders } from "../components/Dashboard/DashboardOrders";
import { ShopkeeperAlert } from "../components/Dashboard/ShopkeeperAlert";
import { DashboardProducts } from "../components/Dashboard/DashboardProducts";

export const DashboardPage = () => {
  const { user } = useAuthState();
  const profileQuery = useProfile(!!user);
  const ordersQuery = useOrders(user?.role === "consumer");
  const productsQuery = useMyProducts(user?.role === "shopkeeper");

  if (!user) {
    return null;
  }

  if (user.role === "consumer" && ordersQuery.isLoading) {
    return <Loader label="Loading dashboard..." />;
  }

  if (
    user.role === "shopkeeper" &&
    (productsQuery.isLoading || profileQuery.isLoading)
  ) {
    return <Loader label="Loading dashboard..." />;
  }

  const profile = profileQuery.data?.profile;

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <DashboardWelcome user={user} hasProfile={!!profile} />

        {user.role === "consumer" && <DashboardOrders />}

        {user.role === "shopkeeper" && (
          <>
            {!profile && <ShopkeeperAlert />}
            {profile && <DashboardProducts />}
          </>
        )}
      </section>
    </div>
  );
};
