import { Navigate, Outlet } from "react-router-dom";
import { useAuthState } from "../features/auth/authHooks";
import type { UserRole } from "../types/api";

export const RequireRole = ({ roles }: { roles: UserRole[] }) => {
  const { user } = useAuthState();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
