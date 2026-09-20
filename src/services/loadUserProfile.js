import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/config";

/**
 * A bejelentkezett felhasználó adatlapjának betöltése.
 *
 * Az új rekordok azonosítója az auth UID, ezért egyetlen
 * olvasással megvannak. A korábban addDoc-kal létrehozott
 * rekordok véletlen azonosítót kaptak - ezeket e-mail alapján
 * keressük meg, de már bejelentkezett állapotban.
 *
 * @param {string} uid A Firebase Authentication UID
 * @param {string} [email] A bejelentkezéskor használt e-mail cím
 * @returns {Promise<{id: string, data: Object} | null>}
 */
export const loadUserProfile = async (uid, email) => {
  const snapshot = await getDoc(doc(db, "users", uid));

  if (snapshot.exists()) {
    return {
      id: uid,
      data: snapshot.data(),
    };
  }

  if (!email) {
    return null;
  }

  const legacySnapshot = await getDocs(
    query(
      collection(db, "users"),
      where("email", "==", email.trim().toLowerCase()),
      limit(1),
    ),
  );

  if (legacySnapshot.empty) {
    return null;
  }

  console.warn(
    "A felhasználó dokumentumának azonosítója nem az auth UID:",
    legacySnapshot.docs[0].id,
  );

  return {
    id: legacySnapshot.docs[0].id,
    data: legacySnapshot.docs[0].data(),
  };
};

export default loadUserProfile;
