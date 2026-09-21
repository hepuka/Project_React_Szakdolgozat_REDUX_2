import { NavLink, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useMemo } from "react";
import Notiflix from "notiflix";
import { signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import "./Sidebar.scss";
import { auth, db } from "../firebase/config";
import {
  selectUserName,
  selectCurrentUserId,
  selectUserRole,
  REMOVE_ACTIVE_USER,
} from "../Redux/slice/authSlice";
import {
  getMenuItems,
  hasPermission,
  PERMISSIONS,
} from "../config/permissions";

import Icon from "./Icon";

const activeLinkClass = ({ isActive }) =>
  isActive ? "sidebar__button sidebar__button_active" : "sidebar__button";

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUserName);
  const currentUserId = useSelector(selectCurrentUserId);
  const userRole = useSelector(selectUserRole);

  /*
   * A menü a jogosultsági táblából áll össze.
   * Szerepkörönként nincs külön lista: mindenki
   * azt látja, amihez joga van.
   */
  const menuItems = useMemo(() => getMenuItems(userRole), [userRole]);

  /*
   * A saját adatlap csak annak nyílik meg,
   * aki felhasználót módosíthat.
   */
  const canOpenOwnProfile = hasPermission(userRole, PERMISSIONS.USERS_UPDATE);

  const userInitial = useMemo(
    () => currentUser?.charAt(0)?.toUpperCase() || "U",
    [currentUser],
  );

  const logoutUser = useCallback(async () => {
    try {
      if (currentUserId) {
        await updateDoc(doc(db, "users", currentUserId), { online: false });
      }

      await signOut(auth);
      dispatch(REMOVE_ACTIVE_USER());
      Notiflix.Notify.success("Sikeres kijelentkezés!");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      Notiflix.Notify.failure("Nem sikerült kijelentkezni.");
    }
  }, [currentUserId, dispatch, navigate]);

  const userCardContent = (
    <>
      <div className="sidebar__avatar">{userInitial}</div>
      <div className="sidebar__userInfo">
        <span>Bejelentkezve</span>
        <strong>{currentUser || "Felhasználó"}</strong>
      </div>
    </>
  );

  return (
    <aside className="sidebar">
      <div className="sidebar__container">
        <div className="sidebar__header">
          <div className="sidebar__brand">
            <div className="sidebar__brandLogo">
              <Icon name="coffee" size={22} />
            </div>
            <div>
              <div className="sidebar__brandName">KunPao's Coffee</div>
              <div className="sidebar__brandSubtitle">Management</div>
            </div>
          </div>

          {canOpenOwnProfile ? (
            <Link to={`/register/${currentUserId}`} className="sidebar__user">
              {userCardContent}
            </Link>
          ) : (
            <div className="sidebar__user">{userCardContent}</div>
          )}
        </div>

        <nav className="sidebar__buttons" aria-label="Főmenü">
          {menuItems.map(({ path, icon, label }) => (
            <NavLink key={path} to={path} className={activeLinkClass}>
              <span className="sidebar__icon">
                <Icon name={icon} />
              </span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button type="button" onClick={logoutUser} className="sidebar__logout">
          <span className="sidebar__icon">
            <Icon name="logout" />
          </span>
          <span>Kilépés</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
