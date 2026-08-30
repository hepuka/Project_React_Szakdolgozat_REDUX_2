import { useEffect } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";

import { useDispatch } from "react-redux";

import { STORE_PRODUCTS } from "../Redux/slice/productSlice";

import { RESET_FILTERS } from "../Redux/slice/filterSlice";

import { db } from "../firebase/config";

const useProducts = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const productsRef = collection(db, "kunpaosproducts");

    const productsQuery = query(productsRef);

    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        const products = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        // -------------------------------------------------
        // KÖZPONTI TERMÉKLISTA FRISSÍTÉSE
        // -------------------------------------------------

        dispatch(
          STORE_PRODUCTS({
            products,
          }),
        );

        // -------------------------------------------------
        // FILTER SLICE FRISSÍTÉSE
        // -------------------------------------------------

        dispatch(
          RESET_FILTERS({
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
    };
  }, [dispatch]);
};

export default useProducts;
