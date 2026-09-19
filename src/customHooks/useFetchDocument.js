import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";

const useFetchDocument = (collectionName, documentID) => {
  const [selectedDocument, setDocument] = useState(null);

  useEffect(() => {
    /*
     * A cancelled jelzi, hogy a komponens időközben eltűnt,
     * vagy másik dokumentumra váltottunk. Ilyenkor a késve
     * megérkező válasszal már nem szabad state-et írni.
     */
    let cancelled = false;

    if (!collectionName || !documentID) {
      setDocument(null);

      return () => {
        cancelled = true;
      };
    }

    const getDocument = async () => {
      try {
        const docRef = doc(db, collectionName, documentID);
        const docSnap = await getDoc(docRef);

        if (cancelled) {
          return;
        }

        if (docSnap.exists()) {
          setDocument({
            id: documentID,
            ...docSnap.data(),
          });
        } else {
          setDocument(null);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("useFetchDocument error:", error);

          setDocument(null);
        }
      }
    };

    getDocument();

    return () => {
      cancelled = true;
    };
  }, [collectionName, documentID]);

  return selectedDocument;
};

export default useFetchDocument;
