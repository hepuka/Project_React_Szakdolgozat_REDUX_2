import { deleteApp, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signOut,
  updateProfile,
} from "firebase/auth";

import { firebaseConfig } from "../firebase/config";

/**
 * Új felhasználói fiók létrehozása úgy, hogy a bejelentkezett
 * adminisztrátor munkamenete megmaradjon.
 *
 * A Firebase kliens SDK-jában a createUserWithEmailAndPassword
 * azonnal be is jelentkezteti az újonnan létrehozott felhasználót
 * abban az auth példányban, amelyikben meghívták. Ha ez az
 * alkalmazás fő példánya, az admin kiesik a saját munkamenetéből.
 *
 * Ezért a fiókot egy külön, ideiglenes Firebase app-példányban
 * hozzuk létre: az ottani bejelentkezés nem érinti a főalkalmazást,
 * a végén pedig a példányt kiléptetjük és eldobjuk.
 *
 * @param {Object} params
 * @param {string} params.email A leendő felhasználó e-mail címe
 * @param {string} params.password A jelszava
 * @param {string} [params.displayName] Megjelenítendő név
 * @returns {Promise<string>} Az új felhasználó auth UID-ja
 */
export const createUserAccount = async ({ email, password, displayName }) => {
  /*
   * Az egyedi név azért kell, hogy két gyors egymás utáni
   * hívás ne ütközzön ugyanazon a példányon.
   */
  const secondaryApp = initializeApp(
    firebaseConfig,
    `user-creation-${Date.now()}`,
  );

  const secondaryAuth = getAuth(secondaryApp);

  try {
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      password,
    );

    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }

    return userCredential.user.uid;
  } finally {
    /*
     * Akkor is takarítunk, ha a létrehozás hibára futott.
     */
    await signOut(secondaryAuth).catch(() => {});

    await deleteApp(secondaryApp).catch(() => {});
  }
};

export default createUserAccount;
