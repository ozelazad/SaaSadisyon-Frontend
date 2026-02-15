import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function RequireAdmin() {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role !== "PLATFORM_ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
