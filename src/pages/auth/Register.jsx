import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import "./Register.scss";
import { useNavigate, useParams } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../firebase/config";
import Notiflix from "notiflix";
import { addDoc, collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import useFetchDocument from "../../customHooks/useFetchDocument.js";
import { use } from "react";

const categories = [
  { id: 1, name: "Admin" },
  { id: 2, name: "Manager" },
  { id: 3, name: "Alap" },
];

const initialSate = {
  name: "",
  email: "",
  tax: "",
  pin: "",
  role: "",
  bdate: "",
  bplace: "",
};

const Register = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const detectForm = (id, f1, f2) => {
    if (id === "ADD") {
      return f1;
    } else {
      return f2;
    }
  };
  const userEdit = useFetchDocument("users", id);

  console.log(userEdit);

  const [user, setUser] = useState({});

  useEffect(() => {
    setUser(id !== "ADD" ? userEdit : {});
  }, []);

  console.log(user);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setUser({ ...user, [name]: value });
  };

  const registerUser = (e) => {
    e.preventDefault();

    if (user.password !== user.passwordConfirm) {
      Notiflix.Notify.failure("Hibás bejelentkezési adat!");
    }

    try {
      createUserWithEmailAndPassword(auth, user.email, user.password).then(
        (userCredential) => {
          // const user = userCredential.user;
          updateProfile(auth.currentUser, {
            displayName: user.name + "|" + user.role + "|" + user.pin,
          });
        }
      );

      addDoc(collection(db, "users"), {
        name: user.name,
        email: user.email,
        bdate: user.bdate,
        bplace: user.bplace,
        password: user.password,
        tax: user.tax,
        pin: user.pin,
        role: user.role,
        createdAt: Timestamp.now().toDate(),
      });

      setUser({ ...initialSate });
      console.log(user);

      Notiflix.Notify.success("Sikeres felhasználó rögzítés!");
      navigate("/users");
    } catch (error) {
      Notiflix.Notify.failure(error.message);
    }
  };

  const editUser = (e) => {
    e.preventDefault();

    try {
      setDoc(doc(db, "users", id), {
        name: user.name,
        email: user.email,
        tax: user.tax,
        pin: user.pin,
        role: user.role,
        createdAt: userEdit.createdAt,
        editedAt: Timestamp.now().toDate(),
        bdate: user.bdate,
        bplace: user.bplace,
        password: user.password,
      });

      updateProfile(auth.currentUser, { displayName: user.name });

      Notiflix.Notify.success("Felhasználó adatai módosítva!");
      navigate("/users");
    } catch (error) {
      Notiflix.Notify.failure(error.message);
    }
  };

  return (
    <Layout>
      <div className="register">
        <h1>
          {detectForm(
            id,
            "Új felhasználó regisztrálása",
            "Felhasználó adatainak módosítása"
          )}
        </h1>
        <form onSubmit={detectForm(id, registerUser, editUser)}>
          <div className="register__row">
            <div className="register__box">
              <label>Felhasználó neve</label>
              <input
                type="text"
                required
                name="name"
                value={user.name}
                onChange={(e) => handleInputChange(e)}
              />
              <label>Születési idő</label>
              <input
                type="date"
                required
                name="bdate"
                value={user.bdate}
                onChange={(e) => handleInputChange(e)}
              />
              <label>Születési hely</label>
              <input
                type="text"
                required
                name="bplace"
                value={user.bplace}
                onChange={(e) => handleInputChange(e)}
              />
            </div>
            <div className="register__box">
              <label>E-mail</label>
              <input
                type="email"
                name="email"
                value={user.email}
                required
                onChange={(e) => handleInputChange(e)}
              />

              <label>Jelszó</label>
              <input
                type="password"
                name="password"
                minLength={8}
                value={user.password}
                required
                onChange={(e) => handleInputChange(e)}
              />

              <label>Adja meg újra a jelszót</label>
              <input
                type="password"
                name="passwordConfirm"
                value={user.passwordConfirm}
                required
                minLength={8}
                onChange={(e) => handleInputChange(e)}
              />
            </div>
            <div className="register__box">
              <label>Jogosultság</label>
              <select
                required
                name="role"
                value={user.role}
                onChange={(e) => handleInputChange(e)}
              >
                <option value="" disabled>
                  -- Válassz jogosultságot --
                </option>
                {categories.map((item) => {
                  return (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  );
                })}
              </select>

              <label>Felhasználó adószáma</label>
              <input
                type="text"
                required
                minLength={8}
                maxLength={8}
                name="tax"
                value={user.tax}
                onChange={(e) => handleInputChange(e)}
              />
              <label>PIN kód</label>
              <input
                type="text"
                required
                minLength={4}
                maxLength={4}
                name="pin"
                value={user.pin}
                onChange={(e) => handleInputChange(e)}
              />
            </div>
          </div>

          <button type="submit" className="login__signInButton">
            {detectForm(id, "Regisztráció", "Módosít")}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Register;
