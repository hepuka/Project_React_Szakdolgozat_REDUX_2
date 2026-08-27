import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import { selectIsLoggedIn, selectUserRole } from "../Redux/slice/authSlice";

import { hasPermission } from "../config/permissions";

const ProtectedRoute = ({ permission }) => {
  const isLoggedIn = useSelector(selectIsLoggedIn);

  const userRole = useSelector(selectUserRole);

  // Nincs bejelentkezve
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // Bejelentkezett, de nincs jogosultsága
  if (permission && !hasPermission(userRole, permission)) {
    return <Navigate to="/main" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
