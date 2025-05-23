import "./Layout.scss";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import { selectUserRole } from "../Redux/slice/authSlice";
import { useSelector } from "react-redux";

const Layout = ({ children }) => {
  const userRole = useSelector(selectUserRole);

  console.log(userRole);

  return (
    <>
      <div className="layout">
        <div className="layout__content">{children}</div>
        <Sidebar />
        <Footer />
      </div>
    </>
  );
};

export default Layout;
