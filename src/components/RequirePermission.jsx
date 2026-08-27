import { useSelector } from "react-redux";
import { selectUserRole } from "../Redux/slice/authSlice";
import { hasPermission } from "../config/permissions";

const RequirePermission = ({ permission, children, fallback = null }) => {
  const role = useSelector(selectUserRole);

  const allowed = hasPermission(role, permission);

  if (!allowed) {
    return fallback;
  }

  return children;
};

export default RequirePermission;
