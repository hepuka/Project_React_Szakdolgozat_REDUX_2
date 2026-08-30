import { useEffect, useState } from "react";

import "./TableProductSelector.scss";

import { useDispatch, useSelector } from "react-redux";

import {
  FILTER_BY_CATEGORY,
  selectFilteredProducts,
  selectSelectedCategory,
  selectSelectedProduct,
  SET_SELECTEDPRODUCT,
} from "../Redux/slice/filterSlice";

import { selectProducts } from "../Redux/slice/productSlice";

import Notiflix from "notiflix";

import { collection, doc, runTransaction, Timestamp } from "firebase/firestore";

import { db } from "../firebase/config";

import { SET_TABLESORDERS } from "../Redux/slice/tableSlice";

const TableProductSelector = ({ selectedTable, tableOrdersLength }) => {
  const dispatch = useDispatch();

  const products = useSelector(selectProducts);

  const filteredProducts = useSelector(selectFilteredProducts);

  const selectedCategory = useSelector(selectSelectedCategory);

  const selectedProduct = useSelector(selectSelectedProduct);

  const [count, setCount] = useState(1);

  /*
   * Az aktuális terméket mindig a
   * realtime Redux listából keressük ki.
   */
  const liveProduct =
    products.find((product) => product.id === selectedProduct?.id) ||
    selectedProduct;

  const stock = Number(liveProduct?.stock || 0);

  // =========================================================
  // KIVÁLASZTOTT TERMÉK VÁLTÁSA
  // =========================================================

  useEffect(() => {
    setCount(1);
  }, [selectedProduct?.id]);

  // =========================================================
  // KATEGÓRIA
  // =========================================================

  const allCategories = Array.from(
    new Set(products.map((item) => item?.category?.trim()).filter(Boolean)),
  );

  const filterProducts = (category) => {
    dispatch(
      FILTER_BY_CATEGORY({
        products,
        category,
      }),
    );
  };

  // =========================================================
  // TERMÉK KIVÁLASZTÁSA
  // =========================================================

  const selectProduct = (product) => {
    const productStock = Number(product?.stock || 0);

    if (productStock <= 0) {
      Notiflix.Notify.warning("Ez a termék elfogyott.");

      return;
    }

    dispatch(
      SET_SELECTEDPRODUCT({
        selectedproduct: product,
      }),
    );
  };

  // =========================================================
  // MENNYISÉG
  // =========================================================

  const decrease = () => {
    setCount((current) => Math.max(1, current - 1));
  };

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
  // ASZTAL TÉTELSZÁM
  // =========================================================

  const refreshTableCounter = () => {
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
        const snapshot = await transaction.get(productRef);

        if (!snapshot.exists()) {
          throw new Error("A termék már nem található.");
        }

        const productData = snapshot.data();

        const currentStock = Number(productData.stock || 0);

        if (count > currentStock) {
          throw new Error(`A termékből már csak ${currentStock} db maradt.`);
        }

        transaction.update(productRef, {
          stock: currentStock - count,
        });

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

      refreshTableCounter();

      Notiflix.Notify.success("Rendelés hozzáadva!");
    } catch (error) {
      console.error("Add order error:", error);

      Notiflix.Notify.failure(
        error.message || "Nem sikerült hozzáadni a terméket.",
      );
    }
  };

  return (
    <div className="placeorder__card tableProductSelector">
      {/* =====================================================
          KATEGÓRIÁK
         ===================================================== */}

      <section className="tableProductSelector__categories">
        <div className="tableProductSelector__sectionHeader">
          <span>Kategóriák</span>

          <h2>Termék kiválasztása</h2>
        </div>

        <div className="tableProductSelector__categoryList">
          <button
            type="button"
            className={`tableProductSelector__category ${
              selectedCategory === "Összes"
                ? "tableProductSelector__category--active"
                : ""
            }`}
            onClick={() => filterProducts("Összes")}
          >
            <span>☕</span>
            Összes
          </button>

          {allCategories.map((category) => (
            <button
              key={category}
              type="button"
              className={`tableProductSelector__category ${
                selectedCategory === category
                  ? "tableProductSelector__category--active"
                  : ""
              }`}
              onClick={() => filterProducts(category)}
            >
              <span>•</span>
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* =====================================================
          TERMÉKEK
         ===================================================== */}

      <section className="tableProductSelector__products">
        <div className="tableProductSelector__sectionHeader">
          <span>Termékek</span>

          <h2>Válaszd ki a terméket</h2>
        </div>

        <div className="tableProductSelector__productList">
          {filteredProducts.length === 0 ? (
            <div className="tableProductSelector__empty">
              Nincs megjeleníthető termék.
            </div>
          ) : (
            filteredProducts.map((item) => {
              const itemStock = Number(item?.stock || 0);

              const isOut = itemStock <= 0;

              const isSelected = selectedProduct?.id === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={isOut}
                  className={`tableProductSelector__product ${
                    isSelected ? "tableProductSelector__product--selected" : ""
                  } ${isOut ? "tableProductSelector__product--disabled" : ""}`}
                  onClick={() => selectProduct(item)}
                >
                  <div className="tableProductSelector__productImage">
                    {item.imageURL ? (
                      <img src={item.imageURL} alt={item.name} />
                    ) : (
                      "☕"
                    )}
                  </div>

                  <div className="tableProductSelector__productInfo">
                    <strong>{item.name}</strong>

                    <span>
                      {Number(item.price || 0).toLocaleString("hu-HU")} Ft
                    </span>

                    <small>
                      {isOut ? "Elfogyott" : `${itemStock} db készleten`}
                    </small>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </section>

      {/* =====================================================
          KIVÁLASZTOTT TERMÉK
         ===================================================== */}

      <section className="tableProductSelector__selected">
        <div className="tableProductSelector__sectionHeader">
          <span>Kiválasztott termék</span>

          <h2>{liveProduct?.name || "Nincs kiválasztva"}</h2>
        </div>

        {!liveProduct ? (
          <div className="tableProductSelector__selectedEmpty">
            <div>☕</div>

            <p>Válassz egy terméket a fenti listából.</p>
          </div>
        ) : (
          <div className="tableProductSelector__selectedContent">
            <div className="tableProductSelector__selectedImage">
              {liveProduct.imageURL ? (
                <img src={liveProduct.imageURL} alt={liveProduct.name} />
              ) : (
                <span>☕</span>
              )}
            </div>

            <div className="tableProductSelector__selectedInfo">
              <strong>{liveProduct.name}</strong>

              <span>{liveProduct.category}</span>

              <span>{liveProduct.packaging}</span>

              <strong>
                {Number(liveProduct.price || 0).toLocaleString("hu-HU")} Ft
              </strong>

              <div
                className={`tableProductSelector__stock ${
                  stock <= 0
                    ? "tableProductSelector__stock--empty"
                    : stock <= Number(liveProduct.minStock || 0)
                      ? "tableProductSelector__stock--low"
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

            <div className="tableProductSelector__controls">
              <div className="tableProductSelector__amount">
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

              <span>
                Részösszeg:{" "}
                <strong>
                  {(count * Number(liveProduct.price || 0)).toLocaleString(
                    "hu-HU",
                  )}{" "}
                  Ft
                </strong>
              </span>

              <button
                type="button"
                className="tableProductSelector__add"
                disabled={selectedTable < 1 || stock <= 0}
                onClick={addToOrder}
              >
                ＋ Hozzáad a rendeléshez
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default TableProductSelector;
