import { useEffect, useState } from "react";

import "./TableProductDetailsContainer.scss";

import { selectSelectedProduct } from "../Redux/slice/filterSlice";

import { selectProducts } from "../Redux/slice/productSlice";

import { useDispatch, useSelector } from "react-redux";

import Notiflix from "notiflix";

import { collection, doc, runTransaction, Timestamp } from "firebase/firestore";

import { db } from "../firebase/config";

import { SET_TABLESORDERS } from "../Redux/slice/tableSlice";

const TableProductDetailsContainer = ({ selectedTable, tableOrdersLength }) => {
  const selectedProduct = useSelector(selectSelectedProduct);

  const products = useSelector(selectProducts);

  const dispatch = useDispatch();

  const [count, setCount] = useState(1);

  // =========================================================
  // AKTUÁLIS TERMÉK A KÖZPONTI REDUX LISTÁBÓL
  // =========================================================

  const liveProduct =
    products.find((product) => product.id === selectedProduct?.id) ||
    selectedProduct;

  const stock = Number(liveProduct?.stock || 0);

  // =========================================================
  // TERMÉKVÁLTÁS
  // =========================================================

  useEffect(() => {
    setCount(1);
  }, [selectedProduct?.id]);

  // =========================================================
  // HA A KÉSZLET KISEBB LETT, MINT A KIVÁLASZTOTT MENNYISÉG
  // =========================================================

  useEffect(() => {
    if (stock <= 0) {
      setCount(1);
      return;
    }

    setCount((currentCount) => Math.min(currentCount, stock));
  }, [stock]);

  // =========================================================
  // MENNYISÉG NÖVELÉSE
  // =========================================================

  const increase = () => {
    if (!liveProduct) {
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
  // ASZTAL TÉTELSZÁM
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
    if (!liveProduct) {
      Notiflix.Notify.warning("Válassz ki egy terméket!");

      return;
    }

    if (selectedTable < 1) {
      Notiflix.Notify.warning("Először válassz asztalt!");

      return;
    }

    if (!liveProduct.id) {
      Notiflix.Notify.failure("A termék azonosítója nem található.");

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
      const productRef = doc(db, "kunpaosproducts", liveProduct.id);

      const tableOrderRef = doc(collection(db, `tableorders_${selectedTable}`));

      await runTransaction(db, async (transaction) => {
        const productSnapshot = await transaction.get(productRef);

        if (!productSnapshot.exists()) {
          throw new Error("A termék már nem található.");
        }

        const productData = productSnapshot.data();

        const currentStock = Number(productData.stock || 0);

        // =================================================
        // VALÓDI FIRESTORE STOCK ELLENŐRZÉS
        // =================================================

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

        // =================================================
        // STOCK LEVONÁSA
        // =================================================

        transaction.update(productRef, {
          stock: newStock,
        });

        // =================================================
        // RENDELÉSI TÉTEL
        // =================================================

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

          productId: liveProduct.id,
        });
      });

      setCount(1);

      incrElement();

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
      {!liveProduct ? (
        <div className="tableProductDetails__empty">
          <div>☕</div>

          <h3>Nincs kiválasztott termék</h3>

          <p>Válassz egy terméket a fenti listából.</p>
        </div>
      ) : (
        <div className="tableProductDetails__content">
          <div className="tableProductDetails__info">
            <span>Kiválasztott termék</span>

            <h2>{liveProduct.name}</h2>

            <div className="tableProductDetails__meta">
              <span>{liveProduct.category}</span>

              <span>{liveProduct.packaging}</span>

              <strong>
                {Number(liveProduct.price || 0).toLocaleString("hu-HU")} Ft
              </strong>
            </div>

            <div
              className={`tableProductDetails__stock ${
                stock <= 0
                  ? "tableProductDetails__stock--empty"
                  : stock <= Number(liveProduct.minStock || 0)
                    ? "tableProductDetails__stock--low"
                    : ""
              }`}
            >
              {stock <= 0
                ? "🔴 Elfogyott"
                : stock <= Number(liveProduct.minStock || 0)
                  ? `🟡 Alacsony készlet • ${stock} db`
                  : `🟢 Készleten • ${stock} db`}
            </div>
          </div>

          <div className="tableProductDetails__settings">
            <div className="tableProductDetails__amount">
              <button
                type="button"
                onClick={decrease}
                disabled={count <= 1 || stock <= 0}
              >
                −
              </button>

              <strong>{count}</strong>

              <button
                type="button"
                onClick={increase}
                disabled={stock <= 0 || count >= stock}
              >
                ＋
              </button>
            </div>

            <span className="tableProductDetails__subtotal">
              Részösszeg:{" "}
              <strong>
                {(count * Number(liveProduct.price || 0)).toLocaleString(
                  "hu-HU",
                )}{" "}
                Ft
              </strong>
            </span>
          </div>

          <button
            type="button"
            className="tableProductDetails__add"
            disabled={selectedTable < 1 || stock <= 0}
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
