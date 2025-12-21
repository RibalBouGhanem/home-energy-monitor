import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function RequireRole({ adminOnly = false, userOnly = false }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (adminOnly && !user?.isAdmin) return <Navigate to="/" replace />;

  if (userOnly && user?.isAdmin) return <Navigate to="/admin" replace />;

  return <Outlet />;
}
