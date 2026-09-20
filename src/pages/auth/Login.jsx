import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "../../firebase/config";

import Notiflix from "notiflix";
import "./Auth.scss";

import { useDispatch } from "react-redux";
import { SET_ACTIVE_USER } from "../../Redux/slice/authSlice";

import { getHomePath } from "../../config/permissions";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

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
      // =====================================================
      // 1. HITELESÍTÉS
      //
      // Először a Firebase Authentication dönt, és csak
      // utána olvasunk bármit az adatbázisból. Így a users
      // kollekció nem érhető el bejelentkezés nélkül.
      // =====================================================

      const userCredential = await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        password,
      );

      const uid = userCredential.user.uid;

      // =====================================================
      // 2. A FELHASZNÁLÓI ADATLAP BETÖLTÉSE
      // =====================================================

      let userId = uid;
      let userData = null;

      const userSnapshot = await getDoc(doc(db, "users", uid));

      if (userSnapshot.exists()) {
        userData = userSnapshot.data();
      } else {
        /*
         * Átmeneti visszafelé-kompatibilitás.
         *
         * A korábban addDoc-kal létrehozott rekordok
         * véletlen azonosítót kaptak, nem az auth UID-t.
         * Ezeket e-mail alapján keressük meg - de már
         * bejelentkezett állapotban.
         */

        const legacySnapshot = await getDocs(
          query(
            collection(db, "users"),
            where("email", "==", normalizedEmail),
            limit(1),
          ),
        );

        if (!legacySnapshot.empty) {
          userId = legacySnapshot.docs[0].id;
          userData = legacySnapshot.docs[0].data();

          console.warn(
            "A felhasználó dokumentumának azonosítója nem az auth UID:",
            userId,
          );
        }
      }

      if (!userData) {
        Notiflix.Notify.failure(
          "A felhasználói adatlap nem található. Kérd meg az adminisztrátort, hogy vegyen fel újra.",
        );

        await signOut(auth);

        return;
      }

      // =====================================================
      // 3. BELÉPÉS RÖGZÍTÉSE
      // =====================================================

      await updateDoc(doc(db, "users", userId), {
        last_login: Timestamp.now().toDate(),
        online: true,
      });

      // =====================================================
      // 4. REDUX
      // =====================================================

      dispatch(
        SET_ACTIVE_USER({
          email: userData.email || normalizedEmail,
          name: userData.name,
          role: userData.role,
          pin: userData.pin,
          id: userId,
        }),
      );

      Notiflix.Notify.success("Sikeres bejelentkezés!");

      // =====================================================
      // 5. NAVIGÁCIÓ
      // =====================================================

      navigate(getHomePath(userData.role));
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
