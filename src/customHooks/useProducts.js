import { useEffect } from "react";

import { collection, onSnapshot } from "firebase/firestore";

import { useDispatch } from "react-redux";

import { STORE_PRODUCTS } from "../Redux/slice/productSlice";

import { SYNC_PRODUCTS } from "../Redux/slice/filterSlice";

import { db } from "../firebase/config";

const useProducts = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const productsRef = collection(db, "kunpaosproducts");

    const unsubscribe = onSnapshot(
      productsRef,
      (snapshot) => {
        const products = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        // =================================================
        // KÖZPONTI TERMÉKLISTA
        // =================================================

        dispatch(
          STORE_PRODUCTS({
            products,
          }),
        );

        // =================================================
        // SZŰRT LISTA FRISSÍTÉSE
        // =================================================

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
    };
  }, [dispatch]);
};

export default useProducts;
