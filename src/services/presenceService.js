import {
  onValue,
  onDisconnect,
  push,
  ref,
  set,
  remove,
} from "firebase/database";

import { realtimeDb } from "../firebase/config";

const PRESENCE_PATH = "presence";

/**
 * Elindítja egy felhasználó jelenlétének figyelését.
 *
 * Minden böngészőfül / kapcsolat saját connection ID-t kap.
 *
 * @param {string} userId Firestore users dokumentum ID
 * @returns {Promise<() => void>} cleanup függvény
 */
export const startUserPresence = (userId) => {
  if (!userId) {
    return Promise.resolve(() => {});
  }

  const connectedRef = ref(realtimeDb, ".info/connected");

  const userConnectionsRef = ref(realtimeDb, `${PRESENCE_PATH}/${userId}`);

  return new Promise((resolve) => {
    let connectionRef = null;
    let resolved = false;

    const unsubscribe = onValue(
      connectedRef,
      async (snapshot) => {
        const connected = snapshot.val() === true;

        if (!connected) {
          return;
        }

        /*
         * Minden új kapcsolat saját ID-t kap.
         */
        connectionRef = push(userConnectionsRef);

        /*
         * FONTOS:
         * Először állítjuk be az onDisconnect
         * műveletet, és csak utána jelöljük online-nak.
         *
         * Így ha közvetlenül ezután megszakad
         * a kapcsolat, a Firebase szerver
         * tudja, hogy el kell távolítani
         * ezt a kapcsolatot.
         */
        try {
          await onDisconnect(connectionRef).remove();

          await set(connectionRef, true);

          if (!resolved) {
            resolved = true;

            resolve(() => {
              unsubscribe();

              if (connectionRef) {
                remove(connectionRef).catch((error) => {
                  console.error("Presence cleanup error:", error);
                });
              }
            });
          }
        } catch (error) {
          console.error("Presence setup error:", error);

          if (!resolved) {
            resolved = true;

            resolve(() => {
              unsubscribe();
            });
          }
        }
      },
      (error) => {
        console.error("Presence connection error:", error);

        if (!resolved) {
          resolved = true;

          resolve(() => {
            unsubscribe();
          });
        }
      },
    );
  });
};
