import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import "./Register.scss";
import { useNavigate, useParams } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import Notiflix from "notiflix";
import { addDoc, collection, doc, setDoc, Timestamp } from "firebase/firestore";

import { auth, db } from "../../firebase/config";
import useFetchDocument from "../../customHooks/useFetchDocument.js";
import detectForm from "../../services/detectForm.js";

const categories = [
  { id: 1, name: "Admin" },
  { id: 2, name: "Manager" },
  { id: 3, name: "Alap" },
  { id: 4, name: "Leader" },
];

const initialState = {
  name: "",
  email: "",
  tax: "",
  pin: "",
  role: "",
  bdate: "",
  bplace: "",
  password: "",
  passwordConfirm: "",
};

const Register = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const userEdit = useFetchDocument("users", id);
  const [user, setUser] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const isEditMode = id !== "ADD";

  useEffect(() => {
    if (isEditMode && userEdit) {
      setUser({
        ...initialState,
        ...userEdit,
        password: "",
        passwordConfirm: "",
      });
    } else if (!isEditMode) {
      setUser({ ...initialState });
    }
  }, [id, userEdit, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const registerUser = async (e) => {
    e.preventDefault();

    if (user.password !== user.passwordConfirm) {
      Notiflix.Notify.failure("A két jelszó nem egyezik!");
      return;
    }

    if (user.password.length < 8) {
      Notiflix.Notify.failure(
        "A jelszónak legalább 8 karakter hosszúnak kell lennie!",
      );
      return;
    }

    setLoading(true);

    try {
      const normalizedEmail = user.email.trim().toLowerCase();

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        user.password,
      );

      await updateProfile(userCredential.user, {
        displayName: `${user.name}|${user.role}|${user.pin}`,
      });

      await addDoc(collection(db, "users"), {
        name: user.name.trim(),
        email: normalizedEmail,
        bdate: user.bdate,
        bplace: user.bplace,
        tax: user.tax,
        pin: user.pin,
        role: user.role,
        createdAt: Timestamp.now().toDate(),
      });

      setUser({ ...initialState });

      Notiflix.Notify.success("Sikeres felhasználó rögzítés!");
      navigate("/users");
    } catch (error) {
      console.error("Register error:", error);

      if (error.code === "auth/email-already-in-use") {
        Notiflix.Notify.failure("Ez az e-mail cím már használatban van.");
      } else if (error.code === "auth/invalid-email") {
        Notiflix.Notify.failure("Érvénytelen e-mail cím.");
      } else if (error.code === "auth/weak-password") {
        Notiflix.Notify.failure("A megadott jelszó túl gyenge.");
      } else {
        Notiflix.Notify.failure("Nem sikerült létrehozni a felhasználót.");
      }
    } finally {
      setLoading(false);
    }
  };

  const editUser = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await setDoc(
        doc(db, "users", id),
        {
          name: user.name.trim(),
          email: user.email.trim().toLowerCase(),
          tax: user.tax,
          pin: user.pin,
          role: user.role,
          createdAt: userEdit.createdAt,
          editedAt: Timestamp.now().toDate(),
          bdate: user.bdate,
          bplace: user.bplace,
        },
        { merge: true },
      );

      Notiflix.Notify.success("Felhasználó adatai módosítva!");

      navigate("/users");
    } catch (error) {
      console.error("Edit user error:", error);

      Notiflix.Notify.failure("Nem sikerült módosítani a felhasználó adatait.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="register">
        <header className="register__header">
          <div>
            <span className="register__eyebrow">
              {isEditMode ? "User Management" : "Adminisztráció"}
            </span>

            <h1>
              {detectForm(
                id,
                "Új felhasználó regisztrálása",
                "Felhasználó adatainak módosítása",
              )}
            </h1>

            <p>
              {isEditMode
                ? "A kiválasztott felhasználó adatainak frissítése."
                : "Hozz létre új felhasználói fiókot a rendszerben."}
            </p>
          </div>

          <button
            type="button"
            className="register__backButton"
            onClick={() => navigate("/users")}
            disabled={loading}
          >
            ← Vissza
          </button>
        </header>

        <form
          autoComplete="off"
          onSubmit={detectForm(id, registerUser, editUser)}
          className="register__form"
        >
          <div className="register__grid">
            <div className="register__box">
              <div className="register__boxHeader">
                <div className="register__boxIcon">👤</div>
                <div>
                  <h2>Személyes adatok</h2>
                  <p>A felhasználó alapadatai</p>
                </div>
              </div>

              <div className="register__field">
                <label htmlFor="name">Felhasználó neve</label>
                <input
                  id="name"
                  type="text"
                  required
                  name="name"
                  value={user.name || ""}
                  placeholder="Pl. Kovács János"
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              <div className="register__field">
                <label htmlFor="bdate">Születési idő</label>
                <input
                  id="bdate"
                  type="date"
                  required
                  name="bdate"
                  value={user.bdate || ""}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              <div className="register__field">
                <label htmlFor="bplace">Születési hely</label>
                <input
                  id="bplace"
                  type="text"
                  required
                  name="bplace"
                  value={user.bplace || ""}
                  placeholder="Pl. Debrecen"
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="register__box">
              <div className="register__boxHeader">
                <div className="register__boxIcon">🔐</div>
                <div>
                  <h2>Bejelentkezési adatok</h2>
                  <p>Hozzáférés a rendszerhez</p>
                </div>
              </div>

              <div className="register__field">
                <label htmlFor="email">E-mail cím</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="off"
                  value={user.email || ""}
                  placeholder="email@example.com"
                  required
                  onChange={handleInputChange}
                  disabled={loading || isEditMode}
                />
              </div>

              {!isEditMode && (
                <>
                  <div className="register__field">
                    <label htmlFor="password">Jelszó</label>

                    <div className="register__passwordWrapper">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        minLength={8}
                        value={user.password || ""}
                        placeholder="Legalább 8 karakter"
                        required
                        autoComplete="new-password"
                        onChange={handleInputChange}
                        disabled={loading}
                      />

                      <button
                        type="button"
                        className="register__passwordToggle"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={
                          showPassword
                            ? "Jelszó elrejtése"
                            : "Jelszó megjelenítése"
                        }
                        disabled={loading}
                      >
                        {showPassword ? "◉" : "◌"}
                      </button>
                    </div>
                  </div>

                  <div className="register__field">
                    <label htmlFor="passwordConfirm">Jelszó megerősítése</label>

                    <div className="register__passwordWrapper">
                      <input
                        id="passwordConfirm"
                        type={showPasswordConfirm ? "text" : "password"}
                        name="passwordConfirm"
                        minLength={8}
                        value={user.passwordConfirm || ""}
                        placeholder="Írd be újra a jelszót"
                        required
                        autoComplete="new-password"
                        onChange={handleInputChange}
                        disabled={loading}
                      />

                      <button
                        type="button"
                        className="register__passwordToggle"
                        onClick={() => setShowPasswordConfirm((prev) => !prev)}
                        aria-label={
                          showPasswordConfirm
                            ? "Jelszó elrejtése"
                            : "Jelszó megjelenítése"
                        }
                        disabled={loading}
                      >
                        {showPasswordConfirm ? "◉" : "◌"}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {isEditMode && (
                <div className="register__editInfo">
                  <span>🔒</span>
                  <p>
                    A jelszó módosítását a felhasználó a „Jelszó visszaállítása”
                    funkción keresztül végezheti el.
                  </p>
                </div>
              )}
            </div>

            <div className="register__box">
              <div className="register__boxHeader">
                <div className="register__boxIcon">🛡️</div>
                <div>
                  <h2>Jogosultságok</h2>
                  <p>Hozzáférési szint és azonosítók</p>
                </div>
              </div>

              <div className="register__field">
                <label htmlFor="role">Jogosultság</label>

                <select
                  id="role"
                  required
                  name="role"
                  value={user.role || ""}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="" disabled>
                    -- Válassz jogosultságot --
                  </option>

                  {categories.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="register__field">
                <label htmlFor="tax">Felhasználó adószáma</label>

                <input
                  id="tax"
                  type="text"
                  required
                  minLength={8}
                  maxLength={8}
                  inputMode="numeric"
                  pattern="[0-9]{8}"
                  name="tax"
                  value={user.tax || ""}
                  placeholder="12345678"
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              <div className="register__field">
                <label htmlFor="pin">PIN kód</label>

                <input
                  id="pin"
                  type="password"
                  required
                  minLength={4}
                  maxLength={4}
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  name="pin"
                  value={user.pin || ""}
                  placeholder="••••"
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="register__actions">
            <button
              type="button"
              className="register__cancelButton"
              onClick={() => navigate("/users")}
              disabled={loading}
            >
              Mégse
            </button>

            <button
              type="submit"
              className="register__submitButton"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="register__spinner" aria-hidden="true" />
                  Mentés...
                </>
              ) : (
                <>
                  <span aria-hidden="true">{isEditMode ? "✓" : "＋"}</span>
                  {detectForm(id, "Regisztráció", "Módosít")}
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </Layout>
  );
};

export default Register;
