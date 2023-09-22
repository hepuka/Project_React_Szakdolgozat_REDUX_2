import { useSelector } from "react-redux";
import { selectUserRole } from "../Redux/slice/authSlice";

export const OnlyAdmin = ({ children }) => {
  const userRole = useSelector(selectUserRole);

  if (userRole === "Admin" || userRole === "Manager") {
    return children;
  }

  return null;
};

export const OnlyEmployee = ({ children }) => {
  const userRole = useSelector(selectUserRole);

  if (userRole === "Alap") {
    return children;
  }

  return null;
};
