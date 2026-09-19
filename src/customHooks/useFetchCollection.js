import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import Notiflix from "notiflix";

const useFetchCollection = (collectionName) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!collectionName) {
      setData([]);

      return undefined;
    }

    const docRef = collection(db, collectionName);
    const q = query(docRef, orderBy("createdAt"));

    /*
     * Az onSnapshot visszatérési értéke a leiratkozó függvény.
     * Ezt a useEffect cleanup ágában meg kell hívni, különben
     * a komponens eltűnése után is élő marad a Firestore kapcsolat.
     */
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const allData = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setData(allData);
      },
      (error) => {
        Notiflix.Notify.failure(error.message);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [collectionName]);

  return data;
};

export default useFetchCollection;
