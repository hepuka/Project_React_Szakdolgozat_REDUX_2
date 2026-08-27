import { useEffect } from "react";
import {
  ref,
  onDisconnect,
  set,
  onValue,
  serverTimestamp,
} from "firebase/database";
import { doc, updateDoc } from "firebase/firestore";
import { rtdb, db } from "../firebase/config";

export const usePresence = (userId) => {
  useEffect(() => {
    if (!userId) return;

    const userStatusRTDBRef = ref(rtdb, `/status/${userId}`);
    const userStatusFirestoreRef = doc(db, "users", userId);

    const isOfflineForRTDB = {
      state: "offline",
      last_changed: serverTimestamp(),
    };
    const isOnlineForRTDB = {
      state: "online",
      last_changed: serverTimestamp(),
    };

    // Figyeljük a saját kapcsolat állapotát
    const connectedRef = ref(rtdb, ".info/connected");

    const unsubscribe = onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === false) return;

      // Beállítjuk, hogy MI TÖRTÉNJEN, ha a kapcsolat megszakad
      // (ezt a Firebase szervere hajtja végre, nem a kliens!)
      onDisconnect(userStatusRTDBRef)
        .set(isOfflineForRTDB)
        .then(() => {
          // Csak sikeres onDisconnect regisztráció UTÁN jelezzük magunkat "online"-nak
          set(userStatusRTDBRef, isOnlineForRTDB);
          updateDoc(userStatusFirestoreRef, { online: true }).catch(() => {});
        });
    });

    return () => unsubscribe();
  }, [userId]);
};
