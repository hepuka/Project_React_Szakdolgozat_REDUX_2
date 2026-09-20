import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useDispatch } from "react-redux";

import { auth } from "../firebase/config";

import {
  SET_ACTIVE_USER,
  REMOVE_ACTIVE_USER,
} from "../Redux/slice/authSlice";

import { loadUserProfile } from "../services/loadUserProfile";

/**
 * A bejelentkezett munkamenet visszaállítása oldalfrissítés után.
 *
 * Korábban ezt a redux-persist végezte: a teljes auth állapot -
 * a PIN kóddal együtt - a localStorage-ban tárolódott. Helyette
 * most a Firebase saját munkamenetére támaszkodunk, és onnan
 * töltjük újra a felhasználó adatlapját.
 *
 * @returns {boolean} true, ha a Firebase már megmondta, van-e
 *   bejelentkezett felhasználó. Eddig nem szabad útvonalat védeni,
 *   mert a védelem kidobná a felhasználót a bejelentkezésre.
 */
const useAuthListener = () => {
  const dispatch = useDispatch();

  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        dispatch(REMOVE_ACTIVE_USER());

        setAuthChecked(true);

        return;
      }

      try {
        const profile = await loadUserProfile(
          firebaseUser.uid,
          firebaseUser.email,
        );

        if (profile) {
          dispatch(
            SET_ACTIVE_USER({
              email: profile.data.email || firebaseUser.email,
              name: profile.data.name,
              role: profile.data.role,
              id: profile.id,
            }),
          );
        } else {
          dispatch(REMOVE_ACTIVE_USER());
        }
      } catch (error) {
        console.error("Auth listener error:", error);

        dispatch(REMOVE_ACTIVE_USER());
      } finally {
        setAuthChecked(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  return authChecked;
};

export default useAuthListener;
