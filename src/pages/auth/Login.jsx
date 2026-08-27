import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, updateDoc, Timestamp } from "firebase/firestore";

import { auth, db } from "../../firebase/config";

import Notiflix from "notiflix";
import "./Auth.scss";

import useFetchCollection from "../../customHooks/useFetchCollection";

import { useDispatch } from "react-redux";
import { SET_ACTIVE_USER } from "../../Redux/slice/authSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const users = useFetchCollection("users");

  const signIn = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      Notiflix.Notify.warning("Add meg az e-mail címedet és a jelszavadat!");

      return;
    }

    setLoading(true);

    try {
      const currentUser = users.find(
        (item) =>
          item.email && item.email.trim().toLowerCase() === normalizedEmail,
      );

      if (!currentUser) {
        Notiflix.Notify.failure("A felhasználó nem található.");

        return;
      }

      // =====================================================
      // FIREBASE AUTHENTICATION
      // =====================================================

      await signInWithEmailAndPassword(auth, normalizedEmail, password);

      await updateDoc(doc(db, "users", currentUser.id), {
        last_login: Timestamp.now().toDate(),
        online: true,
      });

      // =====================================================
      // REDUX
      // =====================================================

      dispatch(
        SET_ACTIVE_USER({
          email: currentUser.email,
          name: currentUser.name,
          role: currentUser.role,
          pin: currentUser.pin,
          id: currentUser.id,
        }),
      );

      Notiflix.Notify.success("Sikeres bejelentkezés!");

      // =====================================================
      // NAVIGÁCIÓ
      // =====================================================

      if (
        currentUser.role === "Admin" ||
        currentUser.role === "Manager" ||
        currentUser.role === "Leader"
      ) {
        navigate("/main");
      } else {
        navigate("/tables");
      }
    } catch (error) {
      console.error("Login error:", error);

      Notiflix.Notify.failure("Hibás e-mail cím vagy jelszó.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login">
      <div className="login__overlay" />

      <section className="login__card">
        <div className="login__brand">
          <div className="login__logo" aria-hidden="true">
            ☕
          </div>

          <div>
            <p className="login__brandName">KunPao's Coffee</p>

            <p className="login__brandSubtitle">Management</p>
          </div>
        </div>

        <div className="login__header">
          <h1>Bejelentkezés</h1>

          <p>Jelentkezzen be a folytatáshoz.</p>
        </div>

        <form onSubmit={signIn} className="login__form">
          <div className="login__field">
            <label htmlFor="email">E-mail cím</label>

            <div className="login__inputWrapper">
              <span className="login__inputIcon" aria-hidden="true">
                ✉
              </span>

              <input
                id="email"
                type="email"
                value={email}
                placeholder="email@example.com"
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="login__field">
            <div className="login__passwordLabel">
              <label htmlFor="password">Jelszó</label>

              <Link to="/reset" className="login__forgot">
                Elfelejtett jelszó
              </Link>
            </div>

            <div className="login__inputWrapper">
              <span className="login__inputIcon" aria-hidden="true">
                🔒
              </span>

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Add meg a jelszavad"
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />

              <button
                type="button"
                className="login__passwordToggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword ? "Jelszó elrejtése" : "Jelszó megjelenítése"
                }
                disabled={loading}
              >
                {showPassword ? "◉" : "◌"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login__signInButton"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="login__spinner" aria-hidden="true" />
                Bejelentkezés...
              </>
            ) : (
              "Bejelentkezés"
            )}
          </button>
        </form>

        <div className="login__footer">
          <span />
          <p>KunPao's Coffee Management</p>
          <span />
        </div>
      </section>
    </main>
  );
};

export default Login;
