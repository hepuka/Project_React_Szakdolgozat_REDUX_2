import { useEffect, useState } from "react";

import "./TableProductDetailsContainer.scss";

import { selectSelectedProduct } from "../Redux/slice/filterSlice";

import { useDispatch, useSelector } from "react-redux";

import Notiflix from "notiflix";

import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
  Timestamp,
} from "firebase/firestore";

import { db } from "../firebase/config";

import { SET_TABLESORDERS } from "../Redux/slice/tableSlice";

const TableProductDetailsContainer = ({ selectedTable, tableOrdersLength }) => {
  const selectedProduct = useSelector(selectSelectedProduct);

  const dispatch = useDispatch();

  const [count, setCount] = useState(1);

  const [stock, setStock] = useState(Number(selectedProduct?.stock || 0));

  const [stockLoading, setStockLoading] = useState(false);

  // =========================================================
  // TERMÉK FIRESTORE KÉSZLETÉNEK FIGYELÉSE
  // =========================================================

  useEffect(() => {
    if (!selectedProduct?.id) {
      setStock(0);
      return;
    }

    setStockLoading(true);

    const productRef = doc(db, "kunpaosproducts", selectedProduct.id);

    const unsubscribe = onSnapshot(
      productRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setStock(0);
          setStockLoading(false);

          return;
        }

        const productData = snapshot.data();

        const currentStock = Number(productData.stock || 0);

        setStock(currentStock);

        setStockLoading(false);

        /*
         * Ha a kiválasztott termék készlete
         * a kiválasztás közben csökkent,
         * és a count nagyobb lett volna,
         * automatikusan korrigáljuk.
         */
        setCount((currentCount) =>
          Math.min(currentCount, Math.max(currentStock, 1)),
        );
      },
      (error) => {
        console.error("Product stock listener error:", error);

        setStockLoading(false);

        Notiflix.Notify.failure("Nem sikerült frissíteni a termék készletét.");
      },
    );

    return () => {
      unsubscribe();
    };
  }, [selectedProduct?.id]);

  // =========================================================
  // TERMÉKVÁLTÁS
  // =========================================================

  useEffect(() => {
    setCount(1);
  }, [selectedProduct?.id]);

  // =========================================================
  // MENNYISÉG NÖVELÉSE
  // =========================================================

  const increase = () => {
    if (!selectedProduct) {
      return;
    }

    if (stockLoading) {
      return;
    }

    if (count >= stock) {
      return;
    }

    setCount((current) => current + 1);
  };

  // =========================================================
  // MENNYISÉG CSÖKKENTÉSE
  // =========================================================

  const decrease = () => {
    setCount((current) => Math.max(1, current - 1));
  };

  // =========================================================
  // ASZTALON LÉVŐ TERMÉKEK SZÁMLÁLÓJA
  // =========================================================

  const incrElement = () => {
    dispatch(
      SET_TABLESORDERS({
        id: selectedTable,
        length: tableOrdersLength,
      }),
    );
  };

  // =========================================================
  // TERMÉK HOZZÁADÁSA
  // =========================================================

  const addToOrder = async () => {
    if (!selectedProduct) {
      Notiflix.Notify.warning("Válassz ki egy terméket!");

      return;
    }

    if (selectedTable < 1) {
      Notiflix.Notify.warning("Először válassz asztalt!");

      return;
    }

    if (!selectedProduct.id) {
      Notiflix.Notify.failure("A termék azonosítója nem található.");

      return;
    }

    if (stockLoading) {
      Notiflix.Notify.warning("A készlet ellenőrzése folyamatban van.");

      return;
    }

    if (stock <= 0) {
      Notiflix.Notify.failure("A kiválasztott termék elfogyott.");

      return;
    }

    if (count > stock) {
      Notiflix.Notify.failure("A választott mennyiség meghaladja a készletet.");

      return;
    }

    try {
      const productRef = doc(db, "kunpaosproducts", selectedProduct.id);

      const tableOrderRef = doc(collection(db, `tableorders_${selectedTable}`));

      // =====================================================
      // FIRESTORE TRANZAKCIÓ
      // =====================================================

      await runTransaction(db, async (transaction) => {
        const productSnapshot = await transaction.get(productRef);

        if (!productSnapshot.exists()) {
          throw new Error("A termék már nem található.");
        }

        const productData = productSnapshot.data();

        const currentStock = Number(productData.stock || 0);

        if (currentStock <= 0) {
          throw new Error(
            `A(z) ${productData.name || "termék"} időközben elfogyott.`,
          );
        }

        if (count > currentStock) {
          throw new Error(
            `A(z) ${
              productData.name || "termék"
            } készletéből csak ${currentStock} db maradt.`,
          );
        }

        const newStock = currentStock - count;

        // -------------------------------------------------
        // KÉSZLET CSÖKKENTÉSE
        // -------------------------------------------------

        transaction.update(productRef, {
          stock: newStock,
        });

        // -------------------------------------------------
        // RENDELÉSI TÉTEL
        // -------------------------------------------------

        transaction.set(tableOrderRef, {
          id: Date.now(),

          name: productData.name,

          price: Number(productData.price || 0),

          category: productData.category,

          packaging: productData.packaging,

          amount: count,

          sum: count * Number(productData.price || 0),

          tableNumber: Number(selectedTable),

          status: "Foglalt",

          createdAt: Timestamp.now().toDate(),

          productId: selectedProduct.id,
        });
      });

      // =====================================================
      // SIKER
      // =====================================================

      setCount(1);

      incrElement();

      /*
       * A stock state-et itt már NEM módosítjuk
       * kézzel.
       *
       * Az onSnapshot automatikusan megkapja
       * a Firestore új értékét.
       */

      Notiflix.Notify.success("Rendelés hozzáadva!");
    } catch (error) {
      console.error("Add order / stock transaction error:", error);

      Notiflix.Notify.failure(
        error.message || "Nem sikerült hozzáadni a terméket.",
      );
    }
  };

  return (
    <div className="placeorder__card placeorder__tableproductdetailsContainer">
      {!selectedProduct ? (
        <div className="tableProductDetails__empty">
          <div>☕</div>

          <h3>Nincs kiválasztott termék</h3>

          <p>Válassz egy terméket a fenti listából.</p>
        </div>
      ) : (
        <div className="tableProductDetails__content">
          {/* =================================================
              TERMÉK INFORMÁCIÓ
             ================================================= */}

          <div className="tableProductDetails__info">
            <span>Kiválasztott termék</span>

            <h2>{selectedProduct.name}</h2>

            <div className="tableProductDetails__meta">
              <span>{selectedProduct.category}</span>

              <span>{selectedProduct.packaging}</span>

              <strong>
                {Number(selectedProduct.price || 0).toLocaleString("hu-HU")} Ft
              </strong>
            </div>

            <div
              className={`tableProductDetails__stock ${
                stock <= 0
                  ? "tableProductDetails__stock--empty"
                  : stock <= Number(selectedProduct.minStock || 0)
                    ? "tableProductDetails__stock--low"
                    : ""
              }`}
            >
              {stockLoading
                ? "Készlet ellenőrzése..."
                : stock <= 0
                  ? "🔴 Elfogyott"
                  : stock <= Number(selectedProduct.minStock || 0)
                    ? `🟡 Alacsony készlet • ${stock} db`
                    : `🟢 Készleten • ${stock} db`}
            </div>
          </div>

          {/* =================================================
              MENNYISÉG
             ================================================= */}

          <div className="tableProductDetails__settings">
            <div className="tableProductDetails__amount">
              <button
                type="button"
                onClick={decrease}
                disabled={count <= 1 || stockLoading || stock <= 0}
              >
                −
              </button>

              <strong>{count}</strong>

              <button
                type="button"
                onClick={increase}
                disabled={stockLoading || stock <= 0 || count >= stock}
              >
                ＋
              </button>
            </div>

            <span className="tableProductDetails__subtotal">
              Részösszeg:{" "}
              <strong>
                {(count * Number(selectedProduct.price || 0)).toLocaleString(
                  "hu-HU",
                )}{" "}
                Ft
              </strong>
            </span>
          </div>

          {/* =================================================
              HOZZÁADÁS
             ================================================= */}

          <button
            type="button"
            className="tableProductDetails__add"
            disabled={selectedTable < 1 || stock <= 0 || stockLoading}
            onClick={addToOrder}
          >
            ＋ Hozzáad a rendeléshez
          </button>
        </div>
      )}
    </div>
  );
};

export default TableProductDetailsContainer;
