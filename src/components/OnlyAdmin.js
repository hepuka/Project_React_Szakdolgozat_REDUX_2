import { useSelector } from "react-redux";
import { selectUserRole } from "../Redux/slice/authSlice";

export const OnlyAdmin = ({ children }) => {
  const userRole = useSelector(selectUserRole);

  if (userRole === "Admin") {
    return children;
  }

  return null;
};

export const OnlyManager = ({ children }) => {
  const userRole = useSelector(selectUserRole);

  if (userRole === "Manager") {
    return children;
  }

  return null;
};

export const OnlyLeader = ({ children }) => {
  const userRole = useSelector(selectUserRole);

  if (userRole === "Leader") {
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
