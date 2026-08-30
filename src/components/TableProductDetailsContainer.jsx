import React, { useEffect, useState } from "react";

import "./TableProductDetailsContainer.scss";

import { selectSelectedProduct } from "../Redux/slice/filterSlice";

import { useDispatch, useSelector } from "react-redux";

import Notiflix from "notiflix";

import { addDoc, collection, Timestamp } from "firebase/firestore";

import { db } from "../firebase/config";

import { SET_TABLESORDERS } from "../Redux/slice/tableSlice";

const TableProductDetailsContainer = ({ selectedTable, tableOrdersLength }) => {
  const selectedProduct = useSelector(selectSelectedProduct);

  const dispatch = useDispatch();

  const [count, setCount] = useState(1);

  const stock = Number(selectedProduct?.stock || 0);

  useEffect(() => {
    setCount(1);
  }, [selectedProduct]);

  const increase = () => {
    if (!selectedProduct) {
      return;
    }

    if (count >= stock) {
      return;
    }

    setCount((current) => current + 1);
  };

  const decrease = () => {
    setCount((current) => Math.max(1, current - 1));
  };

  const incrElement = () => {
    dispatch(
      SET_TABLESORDERS({
        id: selectedTable,
        length: tableOrdersLength,
      }),
    );
  };

  const addToOrder = async () => {
    if (!selectedProduct) {
      Notiflix.Notify.warning("Válassz ki egy terméket!");

      return;
    }

    if (selectedTable < 1) {
      Notiflix.Notify.warning("Először válassz asztalt!");

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
      await addDoc(collection(db, `tableorders_${selectedTable}`), {
        id: new Date().getTime(),

        name: selectedProduct.name,

        price: Number(selectedProduct.price) || 0,

        category: selectedProduct.category,

        packaging: selectedProduct.packaging,

        amount: count,

        sum: count * Number(selectedProduct.price || 0),

        tableNumber: Number(selectedTable),

        status: "Foglalt",

        createdAt: Timestamp.now().toDate(),
      });

      setCount(1);

      incrElement();

      Notiflix.Notify.success("Rendelés hozzáadva!");
    } catch (error) {
      console.error("Add order error:", error);

      Notiflix.Notify.failure("Nem sikerült hozzáadni a terméket.");
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
              {stock <= 0
                ? "🔴 Elfogyott"
                : stock <= Number(selectedProduct.minStock || 0)
                  ? `🟡 Alacsony készlet • ${stock} db`
                  : `🟢 Készleten • ${stock} db`}
            </div>
          </div>

          <div className="tableProductDetails__settings">
            <div className="tableProductDetails__amount">
              <button type="button" onClick={decrease} disabled={count <= 1}>
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
                {(count * Number(selectedProduct.price || 0)).toLocaleString(
                  "hu-HU",
                )}{" "}
                Ft
              </strong>
            </span>

            <button
              type="button"
              className="tableProductDetails__add"
              disabled={selectedTable < 1 || stock <= 0}
              onClick={addToOrder}
            >
              ＋ Hozzáad a rendeléshez
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableProductDetailsContainer;
