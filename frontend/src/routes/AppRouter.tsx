import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useAuthBootstrap } from "../features/auth/authHooks";
import { RootLayout } from "../layout/RootLayout";
import { Loader } from "../components/Loader";
import { RequireAuth } from "./RequireAuth";
import { RequireRole } from "./RequireRole";
import { ShopkeeperCreateProductPage } from "../pages/ShopkeeperCreateProductPage";
import { CartPage } from "../pages/CartPage";
import { DashboardPage } from "../pages/DashboardPage";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { NotificationsPage } from "../pages/NotificationsPage";
import { ProfilePage } from "../pages/ProfilePage";
import { ProductDetailsPage } from "../pages/ProductDetailsPage";
import { ProductsPage } from "../pages/ProductsPage";
import { RegisterPage } from "../pages/RegisterPage";
import { ResetPasswordPage } from "../pages/ResetPasswordPage";
import { VerifyEmailPage } from "../pages/VerifyEmailPage";
import { CheckoutSuccessPage } from "../pages/CheckoutSuccessPage";
import { CheckoutCancelPage } from "../pages/CheckoutCancelPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
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
              { path: "checkout/success", element: <CheckoutSuccessPage /> },
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
]);

export const AppRouter = () => {
  const bootstrap = useAuthBootstrap();

  if (bootstrap.isLoading) {
    return <Loader label="Initializing session..." />;
  }

  return <RouterProvider router={router} />;
};
