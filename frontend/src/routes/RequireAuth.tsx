import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthState } from "../features/auth/authHooks";

export const RequireAuth = () => {
  const { user, initialized } = useAuthState();
  const location = useLocation();

  if (!initialized) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};
