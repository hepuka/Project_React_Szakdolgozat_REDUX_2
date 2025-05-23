import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config";
import Notiflix from "notiflix";
import "./Auth.scss";
import useFetchCollection from "../../customHooks/useFetchCollection";
import { useDispatch } from "react-redux";
import { SET_ACTIVE_USER } from "../../Redux/slice/authSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const users = useFetchCollection("users"); 

  const signIn = (e) => {
    e.preventDefault();
    const currentUser = users.find((item) => item.email === email);

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        //const user = userCredential.user;

       dispatch(
          SET_ACTIVE_USER({
            email: currentUser.email,
            name: currentUser.name,
            role: currentUser.role, 
            pin: currentUser.pin,
            id:currentUser.id
          })
        ); 

        Notiflix.Notify.success("Sikeres bejelentkezés!");

        currentUser.role === "Admin" || currentUser.role === "Manager"
          ? navigate("/main")
          : navigate("/tables");
      })
      .catch((error) => {
        Notiflix.Notify.failure(error.message);
      });
  };

  return (
    <div className="login">
      <div className="left">
        <h1>KunPao's Coffee Management</h1>
        <form onSubmit={signIn}>
          <label>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Jelszó</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="login__signInButton"
          >
            Belépés
          </button>
          <div className="login__resetSection">
            <Link to="/reset">
              <button>Elfelejtett jelszó</button>
            </Link>
          </div>
        </form>
      </div>
      <div className="right"></div>
    </div>
  );
};

export default Login;
