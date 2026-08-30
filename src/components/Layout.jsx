import "./Layout.scss";

import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";

import useProducts from "../customHooks/useProducts";

const Layout = ({ children }) => {
  useProducts();

  return (
    <div className="layout">
      <main className="layout__main">
        <div className="layout__content">{children}</div>

        <Footer />
      </main>

      <Sidebar />
    </div>
  );
};

export default Layout;
