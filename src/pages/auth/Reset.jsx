import React, { useState } from "react";
import "./Auth.scss";
import Notiflix from "notiflix";
import { auth } from "../../firebase/config";
import { sendPasswordResetEmail } from "firebase/auth";
import { Link } from "react-router-dom";

const Reset = () => {
  const [email, setEmail] = useState("");

  const resetPassword = (e) => {
    e.preventDefault();

    if (email) {
      sendPasswordResetEmail(auth, email)
        .then(() => {
          Notiflix.Notify.success(
            "Ellenőrizd email fiókodat a további teendőkért!"
          );
        })
        .catch((error) => {
          Notiflix.Notify.failure(error.message);
        });
    } else {
      Notiflix.Notify.failure("Add meg a regisztált email címed!");
    }
  };

  return (
    <div className="login">
      <div className="left">
        <h1>Elfelejtett jelszó</h1>
        <form onSubmit={resetPassword}>
          <label>Regisztrált e-mail</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <p>
            Add meg a regisztrált email címedet, majd kövesd az emailben
            leírtakat.
          </p>
          <button type="submit" className="login__signInButton">
            Elküld
          </button>
          <div className="login__resetSection">
            <Link to="/">
              <button className="login__resetButton">Vissza</button>
            </Link>
          </div>
        </form>
      </div>
      <div className="right"></div>
    </div>
  );
};

export default Reset;
