import { useEffect } from "react";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

import { db } from "../firebase/config";

import { useDispatch } from "react-redux";

import { STORE_PRODUCTS, CLEAR_PRODUCTS } from "../Redux/slice/productSlice";

import { SYNC_PRODUCTS } from "../Redux/slice/filterSlice";

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

        /*
         * 1. Teljes realtime terméklista
         */
        dispatch(
          STORE_PRODUCTS({
            products,
          }),
        );

        /*
         * 2. A filterSlice aktuális
         * szűrt listájának frissítése
         *
         * A SYNC_PRODUCTS a jelenlegi
         * selectedCategory alapján dolgozik.
         */
        dispatch(
          SYNC_PRODUCTS({
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
