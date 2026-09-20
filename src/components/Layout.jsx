import "./Layout.scss";

import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";

import useProducts from "../customHooks/useProducts";

const Layout = ({ children }) => {
  useProducts();

  return (
    <div className="layout">
      {/*
       * Az oldalsáv a bal oldalon áll: az olvasási irány
       * szerint először a navigáció, utána a tartalom.
       */}

      <Sidebar />

      <main className="layout__main">
        <div className="layout__content">{children}</div>

        <Footer />
      </main>
    </div>
  );
};

export default Layout;
