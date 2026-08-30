import { NavLink, useNavigate } from "react-router-dom";
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
  REMOVE_ACTIVE_USER,
} from "../Redux/slice/authSlice";
import { OnlyAdmin, OnlyEmployee, OnlyManager, OnlyLeader } from "./OnlyAdmin";
import { serverTimestamp } from "firebase/database";
import { useEffect } from "react";

// Közös menüpontok, szerepkörönként összeállítva
const NAV_ITEMS = {
  admin: [
    { to: "/main", icon: "⌂", label: "Főoldal" },
    { to: "/users", icon: "👥", label: "Felhasználók" },
    { to: "/register/ADD", icon: "＋", label: "Új felhasználó" },
    { to: "/contact", icon: "💬", label: "Hibabejelentés" },
  ],
  manager: [
    { to: "/main", icon: "⌂", label: "Főoldal" },
    { to: "/users", icon: "👥", label: "Felhasználók" },
    { to: "/products", icon: "☕", label: "Termékek" },
    { to: "/add-product/ADD", icon: "＋", label: "Új termék" },
    { to: "/orders", icon: "🧾", label: "Összes rendelés" },
    { to: "/contact", icon: "💬", label: "Hibabejelentés" },
  ],
  leader: [
    { to: "/main", icon: "⌂", label: "Főoldal" },
    { to: "/users", icon: "👥", label: "Felhasználók" },
    { to: "/products", icon: "☕", label: "Termékek" },
    { to: "/orders", icon: "🧾", label: "Összes rendelés" },
    { to: "/business", icon: "📊", label: "Üzleti összesítő" },
    { to: "/contact", icon: "💬", label: "Hibabejelentés" },
  ],
  employee: [
    { to: "/tables", icon: "🛎️", label: "Rendelés / Fizetés" },
    { to: "/products", icon: "☕", label: "Termékek" },
    { to: "/orders", icon: "🧾", label: "Összes rendelés" },
  ],
};

const activeLinkClass = ({ isActive }) =>
  isActive ? "sidebar__button sidebar__button_active" : "sidebar__button";

// Kiemelve, hogy ne jöjjön létre újra minden rendernél
const NavItems = ({ items }) => (
  <>
    {items.map(({ to, icon, label }) => (
      <NavLink key={to} to={to} className={activeLinkClass}>
        <span className="sidebar__icon">{icon}</span>
        <span>{label}</span>
      </NavLink>
    ))}
  </>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUserName);
  const currentUserId = useSelector(selectCurrentUserId);

  useEffect(() => {
    if (!currentUserId) return;

    const interval = setInterval(() => {
      updateDoc(doc(db, "users", currentUserId), {
        lastActive: serverTimestamp(),
      }).catch(() => {});
    }, 30000);

    return () => clearInterval(interval);
  }, [currentUserId]);

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
            <div className="sidebar__avatar">{userInitial}</div>
            <div className="sidebar__userInfo">
              <span>Bejelentkezve</span>
              <strong>{currentUser || "Felhasználó"}</strong>
            </div>
          </div>
        </div>

        <nav className="sidebar__buttons" aria-label="Főmenü">
          <OnlyAdmin>
            <NavItems items={NAV_ITEMS.admin} />
          </OnlyAdmin>

          <OnlyManager>
            <NavItems items={NAV_ITEMS.manager} />
          </OnlyManager>

          <OnlyLeader>
            <NavItems items={NAV_ITEMS.leader} />
          </OnlyLeader>

          <OnlyEmployee>
            <NavItems items={NAV_ITEMS.employee} />
          </OnlyEmployee>
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
