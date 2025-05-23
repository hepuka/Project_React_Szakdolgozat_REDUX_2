import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Notiflix from "notiflix";
import "./Sidebar.scss";
import { useSelector } from "react-redux";
import { selectUserName } from "../Redux/slice/authSlice";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { OnlyAdmin, OnlyEmployee } from "./OnlyAdmin";
import { useDispatch } from "react-redux";
import { REMOVE_ACTIVE_USER } from "../Redux/slice/authSlice";

const Sidebar = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectUserName);
  const dispatch = useDispatch();

  const logoutUser = () => {
    signOut(auth)
      .then(() => {
        dispatch(REMOVE_ACTIVE_USER());

        Notiflix.Notify.success("Sikeres kijelentkezés!");
        navigate("/");
      })
      .catch((error) => {
        Notiflix.Notify.failure(error.message);
      });
  };

  const activeLink = ({ isActive }) => {
    return isActive
      ? "sidebar__button sidebar__button_active"
      : "sidebar__button";
  };

  return (
    <div className="sidebar">
      <div className="sidebar__container">
        <div className="sidebar__title flex-item">
          <h1>Bejelentkezve: {currentUser}</h1>
        </div>
        <div className="sidebar__buttons flex-item">
          <OnlyAdmin>
            <NavLink to="/users" className={activeLink}>
              Felhasználók
            </NavLink>

            <NavLink to="/register/ADD" className={activeLink}>
              Új felhasználó regisztrálása
            </NavLink>
          </OnlyAdmin>

          <NavLink to="/products" className={activeLink}>
            Termékek
          </NavLink>

          <OnlyAdmin>
            <NavLink to="/add-product/ADD" className={activeLink}>
              Új termék hozzáadása
            </NavLink>
          </OnlyAdmin>

          <NavLink to="/orders" className={activeLink}>
            Összes rendelés
          </NavLink>

          <OnlyAdmin>
            <NavLink to="/business" className={activeLink}>
              Üzleti összesítő
            </NavLink>

            <NavLink to="/contact" className={activeLink}>
              Hibabejelentés
            </NavLink>
          </OnlyAdmin>

          <OnlyEmployee>
            <NavLink to="/tables" className={activeLink}>
              Rendelés / Fizetés
            </NavLink>
          </OnlyEmployee>
          <OnlyAdmin>
            <NavLink to="/main" className="sidebar__button">
              Főoldal
            </NavLink>
          </OnlyAdmin>
          <div onClick={logoutUser} className="sidebar__button">
            Kilépés
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
