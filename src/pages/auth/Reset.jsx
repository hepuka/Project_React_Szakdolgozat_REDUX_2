import React, { useState } from "react";
import "./Auth.scss";
import Notiflix from "notiflix";
import { auth } from "../../firebase/config";
import { sendPasswordResetEmail } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

const Reset = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const resetPassword = async (e) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      Notiflix.Notify.warning("Add meg a regisztrált e-mail címed!");
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, normalizedEmail);

      Notiflix.Notify.success(
        "Ellenőrizd az e-mail fiókodat a további teendőkért!",
      );

      navigate("/");
    } catch (error) {
      console.error("Password reset error:", error);

      Notiflix.Notify.failure(
        "Nem sikerült elküldeni a jelszó-visszaállító e-mailt.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login">
      <div className="login__overlay" />

      <section className="login__card login__card--reset">
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
          <h1>Jelszó visszaállítása</h1>

          <p>
            Add meg a regisztrált e-mail címedet, és elküldjük a
            jelszó-visszaállításhoz szükséges linket.
          </p>
        </div>

        <form onSubmit={resetPassword} className="login__form">
          <div className="login__field">
            <label htmlFor="reset-email">Regisztrált e-mail cím</label>

            <div className="login__inputWrapper">
              <span className="login__inputIcon" aria-hidden="true">
                ✉
              </span>

              <input
                id="reset-email"
                type="email"
                value={email}
                placeholder="email@example.com"
                autoComplete="email"
                autoFocus
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
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
                Küldés...
              </>
            ) : (
              "Jelszó-visszaállító e-mail küldése"
            )}
          </button>
          <Link to="/" className="login__backButton">
            Vissza a bejelentkezéshez
          </Link>
        </form>

        <div className="login__infoBox">
          <p>
            Ha nem érkezik meg az e-mail néhány percen belül, ellenőrizd a spam
            vagy a levélszemét mappát.
          </p>
        </div>

        <div className="login__footer">
          <span />

          <p>KunPao's Coffee Management</p>

          <span />
        </div>
      </section>
    </main>
  );
};

export default Reset;
