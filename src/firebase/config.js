import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/* =========================================================
   FIREBASE
   =========================================================

   Az itt szereplő értékek nyilvános kliensazonosítók, nem
   titkos kulcsok: a hozzáférést a firestore.rules szabályozza.

   A firebaseConfig azért exportált, mert a createUserAccount
   egy második, ideiglenes app-példányt indít vele, hogy új
   felhasználó létrehozásakor az adminisztrátor ne essen ki a
   saját munkamenetéből.
   ========================================================= */

export const firebaseConfig = {
  apiKey: "AIzaSyDSE1OjBBAX3obWDUeunPQVd0wfbe35jhQ",
  authDomain: "szakdolgozat-9a288.firebaseapp.com",
  projectId: "szakdolgozat-9a288",
  storageBucket: "szakdolgozat-9a288.appspot.com",
  messagingSenderId: "1010145898746",
  appId: "1:1010145898746:web:f983c61a7294e979e49943",
  measurementId: "G-T1BD2WRM55",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export const storage = getStorage(app);

export default app;
