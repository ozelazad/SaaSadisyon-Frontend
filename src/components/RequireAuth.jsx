import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function RequireAuth() {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role === "PLATFORM_ADMIN" && location.pathname !== "/admin") {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
