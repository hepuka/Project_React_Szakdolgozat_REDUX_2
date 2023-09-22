import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";

const useFetchDocument = (collectionName, documentID) => {
  const [document, setDocument] = useState(null);

  const getDocument = async () => {
    const docRef = doc(db, collectionName, documentID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // console.log("Document data:", docSnap.data());
      const obj = {
        id: documentID,
        ...docSnap.data(),
      };
      setDocument(obj);
    } else {
      console.log("Nem található dokumentum");
    }
  };

  useEffect(() => {
    getDocument();
  }, []);

  return { document };
};

export default useFetchDocument;
