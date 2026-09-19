import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import { selectIsLoggedIn, selectUserRole } from "../Redux/slice/authSlice";

import { getHomePath, hasPermission } from "../config/permissions";

const ProtectedRoute = ({ permission }) => {
  const isLoggedIn = useSelector(selectIsLoggedIn);

  const userRole = useSelector(selectUserRole);

  const location = useLocation();

  // Nincs bejelentkezve
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // Bejelentkezett, de nincs jogosultsága
  if (permission && !hasPermission(userRole, permission)) {
    const homePath = getHomePath(userRole);

    /*
     * Ha a szerepkör kezdőoldalára sincs joga,
     * ne keletkezzen végtelen átirányítás:
     * ilyenkor a bejelentkezésre küldjük vissza.
     */
    if (homePath === location.pathname) {
      return <Navigate to="/" replace />;
    }

    return <Navigate to={homePath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
