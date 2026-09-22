import { useEffect } from "react";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

import { useDispatch } from "react-redux";

import { db } from "../firebase/config";

import { STORE_PRODUCTS, CLEAR_PRODUCTS } from "../Redux/slice/productSlice";

/* =========================================================
   VALÓS IDEJŰ TERMÉKLISTA
   =========================================================

   Egyetlen dispatch. A kategóriára szűrt listát korábban
   ugyanitt egy második dispatch tartotta szinkronban; most
   származtatott érték, ezért nem tud elcsúszni.
   ========================================================= */

const useProducts = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const productsRef = collection(db, "kunpaosproducts");

    const productsQuery = query(productsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        const products = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        dispatch(
          STORE_PRODUCTS({
            products,
          }),
        );
      },
      (error) => {
        console.error("Products listener error:", error);
      },
    );

    return () => {
      unsubscribe();

      dispatch(CLEAR_PRODUCTS());
    };
  }, [dispatch]);
};

export default useProducts;
