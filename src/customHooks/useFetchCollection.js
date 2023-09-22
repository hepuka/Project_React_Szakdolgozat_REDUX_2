import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import Notiflix from "notiflix";

const useFetchCollection = (collectionName) => {
  const [data, setData] = useState([]);

  const getCollection = () => {
    try {
      const docRef = collection(db, collectionName);
      const q = query(docRef, orderBy("createdAt"));

      onSnapshot(q, (snapshot) => {
        const allData = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setData(allData);
      });
    } catch (error) {
      Notiflix.Notify.failure(error.message);
    }
  };

  useEffect(() => {
    getCollection();
  }, []);

  return data;
};

export default useFetchCollection;
