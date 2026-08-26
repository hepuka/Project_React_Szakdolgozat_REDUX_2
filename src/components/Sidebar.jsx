import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Notiflix from "notiflix";
import { signOut } from "firebase/auth";

import "./Sidebar.scss";
import { auth } from "../firebase/config";
import { selectUserName, REMOVE_ACTIVE_USER } from "../Redux/slice/authSlice";
import { OnlyAdmin, OnlyEmployee } from "./OnlyAdmin";

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUserName);

  const logoutUser = async () => {
    try {
      await signOut(auth);
      dispatch(REMOVE_ACTIVE_USER());

      Notiflix.Notify.success("Sikeres kijelentkezés!");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      Notiflix.Notify.failure("Nem sikerült kijelentkezni.");
    }
  };

  const activeLink = ({ isActive }) =>
    isActive ? "sidebar__button sidebar__button_active" : "sidebar__button";

  return (
    <aside className="sidebar">
      <div className="sidebar__container">
        <div className="sidebar__header">
          <div className="sidebar__brand">
            <div className="sidebar__brandLogo">☕</div>

            <div>
              <div className="sidebar__brandName">KunPao's Coffee</div>
              <div className="sidebar__brandSubtitle">Management</div>
            </div>
          </div>

          <div className="sidebar__user">
            <div className="sidebar__avatar">
              {currentUser?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="sidebar__userInfo">
              <span>Bejelentkezve</span>
              <strong>{currentUser || "Felhasználó"}</strong>
            </div>
          </div>
        </div>

        <nav className="sidebar__buttons" aria-label="Főmenü">
          <OnlyAdmin>
            <NavLink to="/users" className={activeLink}>
              <span className="sidebar__icon">👥</span>
              <span>Felhasználók</span>
            </NavLink>

            <NavLink to="/register/ADD" className={activeLink}>
              <span className="sidebar__icon">＋</span>
              <span>Új felhasználó</span>
            </NavLink>
          </OnlyAdmin>

          <NavLink to="/products" className={activeLink}>
            <span className="sidebar__icon">☕</span>
            <span>Termékek</span>
          </NavLink>

          <OnlyAdmin>
            <NavLink to="/add-product/ADD" className={activeLink}>
              <span className="sidebar__icon">＋</span>
              <span>Új termék</span>
            </NavLink>
          </OnlyAdmin>

          <NavLink to="/orders" className={activeLink}>
            <span className="sidebar__icon">🧾</span>
            <span>Összes rendelés</span>
          </NavLink>

          <OnlyAdmin>
            <NavLink to="/business" className={activeLink}>
              <span className="sidebar__icon">📊</span>
              <span>Üzleti összesítő</span>
            </NavLink>

            <NavLink to="/contact" className={activeLink}>
              <span className="sidebar__icon">💬</span>
              <span>Hibabejelentés</span>
            </NavLink>
          </OnlyAdmin>

          <OnlyEmployee>
            <NavLink to="/tables" className={activeLink}>
              <span className="sidebar__icon">🛎️</span>
              <span>Rendelés / Fizetés</span>
            </NavLink>
          </OnlyEmployee>

          {/*           <OnlyAdmin>
            <NavLink to="/main" className={activeLink}>
              <span className="sidebar__icon">⌂</span>
              <span>Főoldal</span>
            </NavLink>
          </OnlyAdmin> */}
        </nav>

        <button type="button" onClick={logoutUser} className="sidebar__logout">
          <span className="sidebar__icon">↪</span>
          <span>Kilépés</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
