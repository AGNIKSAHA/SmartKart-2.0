import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { useAuthBootstrap } from "../features/auth/authHooks";
import { RootLayout } from "../layout/RootLayout";
import { Loader } from "../components/Loader";
import { RequireAuth } from "./RequireAuth";
import { RequireRole } from "./RequireRole";
import { NotFoundPage } from "../pages/NotFoundPage";

const ShopkeeperCreateProductPage = lazy(() =>
  import("../pages/ShopkeeperCreateProductPage").then((m) => ({
    default: m.ShopkeeperCreateProductPage,
  })),
);
const CartPage = lazy(() =>
  import("../pages/CartPage").then((m) => ({ default: m.CartPage })),
);
const DashboardPage = lazy(() =>
  import("../pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const ForgotPasswordPage = lazy(() =>
  import("../pages/ForgotPasswordPage").then((m) => ({
    default: m.ForgotPasswordPage,
  })),
);
const HomePage = lazy(() =>
  import("../pages/HomePage").then((m) => ({ default: m.HomePage })),
);
const LoginPage = lazy(() =>
  import("../pages/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const NotificationsPage = lazy(() =>
  import("../pages/NotificationsPage").then((m) => ({
    default: m.NotificationsPage,
  })),
);
const ProfilePage = lazy(() =>
  import("../pages/ProfilePage").then((m) => ({ default: m.ProfilePage })),
);
const ProductDetailsPage = lazy(() =>
  import("../pages/ProductDetailsPage").then((m) => ({
    default: m.ProductDetailsPage,
  })),
);
const ProductsPage = lazy(() =>
  import("../pages/ProductsPage").then((m) => ({ default: m.ProductsPage })),
);
const RegisterPage = lazy(() =>
  import("../pages/RegisterPage").then((m) => ({ default: m.RegisterPage })),
);
const ResetPasswordPage = lazy(() =>
  import("../pages/ResetPasswordPage").then((m) => ({
    default: m.ResetPasswordPage,
  })),
);
const VerifyEmailPage = lazy(() =>
  import("../pages/VerifyEmailPage").then((m) => ({
    default: m.VerifyEmailPage,
  })),
);
const CheckoutSuccessPage = lazy(() =>
  import("../pages/CheckoutSuccessPage").then((m) => ({
    default: m.CheckoutSuccessPage,
  })),
);
const CheckoutCancelPage = lazy(() =>
  import("../pages/CheckoutCancelPage").then((m) => ({
    default: m.CheckoutCancelPage,
  })),
);

const SuspenseLayout = () => (
  <Suspense fallback={<Loader label="Loading page..." />}>
    <Outlet />
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        element: <SuspenseLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "login", element: <LoginPage /> },
          { path: "register", element: <RegisterPage /> },
          { path: "verify-email", element: <VerifyEmailPage /> },
          { path: "forgot-password", element: <ForgotPasswordPage /> },
          { path: "reset-password", element: <ResetPasswordPage /> },
          { path: "products", element: <ProductsPage /> },
          { path: "products/:productId", element: <ProductDetailsPage /> },
          {
            element: <RequireAuth />,
            children: [
              { path: "notifications", element: <NotificationsPage /> },
              { path: "dashboard", element: <DashboardPage /> },
              { path: "profile", element: <ProfilePage /> },
              {
                element: <RequireRole roles={["consumer"]} />,
                children: [
                  { path: "cart", element: <CartPage /> },
                  {
                    path: "checkout/success",
                    element: <CheckoutSuccessPage />,
                  },
                  { path: "checkout/cancel", element: <CheckoutCancelPage /> },
                ],
              },
              {
                element: <RequireRole roles={["shopkeeper"]} />,
                children: [
                  {
                    path: "shopkeeper/products/new",
                    element: <ShopkeeperCreateProductPage />,
                  },
                ],
              },
            ],
          },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);

export const AppRouter = () => {
  const bootstrap = useAuthBootstrap();

  if (bootstrap.isLoading) {
    return <Loader label="Initializing session..." />;
  }

  return <RouterProvider router={router} />;
};
