import { useEffect, useState } from "react";
import "./TableProductSelector.scss";

import { useDispatch, useSelector } from "react-redux";

import {
  ALL_CATEGORIES,
  CLEAR_SELECTEDPRODUCT,
  SET_CATEGORY,
  SET_SELECTEDPRODUCT,
  selectFilteredProducts,
  selectProducts,
  selectSelectedCategory,
  selectSelectedProduct,
} from "../Redux/slice/productSlice";

import Notiflix from "notiflix";

import { collection, doc, runTransaction, Timestamp } from "firebase/firestore";

import { db } from "../firebase/config";

import { TABLE_ORDERS } from "../config/tables";

import Icon from "./Icon";

const TableProductSelector = ({ selectedTable, onOrderAdded }) => {
  const dispatch = useDispatch();

  /*
   * TELJES, REALTIME TERMÉKLISTA
   */
  const products = useSelector(selectProducts);

  /*
   * AKTUÁLISAN SZŰRT TERMÉKEK
   */
  const filteredProducts = useSelector(selectFilteredProducts);

  /*
   * AKTUÁLIS KATEGÓRIA
   */
  const selectedCategory = useSelector(selectSelectedCategory);

  /*
   * KIVÁLASZTOTT TERMÉK
   *
   * Fontos:
   * ezt kizárólag Reduxból vesszük.
   */
  const selectedProduct = useSelector(selectSelectedProduct);

  /*
   * KIVÁLASZTOTT MENNYISÉG
   */
  const [count, setCount] = useState(1);

  // =========================================================
  // AKTUÁLIS TERMÉK A REALTIME REDUX LISTÁBÓL
  // =========================================================

  const liveProduct = selectedProduct
    ? products.find((product) => product.id === selectedProduct.id) ||
      selectedProduct
    : null;

  /*
   * Aktuális készlet.
   *
   * Fontos, hogy mindig a liveProduct értékéből dolgozunk,
   * így a realtime Firestore frissítés után azonnal
   * az aktuális stock jelenik meg.
   */
  const stock = Number(liveProduct?.stock || 0);

  // =========================================================
  // MENNYISÉG RESET
  // =========================================================

  useEffect(() => {
    setCount(1);
  }, [selectedProduct?.id]);

  // =========================================================
  // KATEGÓRIÁK GENERÁLÁSA
  // =========================================================

  const allCategories = Array.from(
    new Set(products.map((item) => item?.category?.trim()).filter(Boolean)),
  );

  // =========================================================
  // KATEGÓRIA SZŰRÉS
  // =========================================================

  const filterProducts = (category) => {
    dispatch(SET_CATEGORY(category));
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

    dispatch(SET_SELECTEDPRODUCT(product));
  };

  // =========================================================
  // MENNYISÉG CSÖKKENTÉSE
  // =========================================================

  const decrease = () => {
    setCount((current) => Math.max(1, current - 1));
  };

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
  // ÖSSZES TERMÉK MEGJELENÍTÉSE
  // =========================================================

  const showAllProducts = () => {
    dispatch(SET_CATEGORY(ALL_CATEGORIES));
  };

  // =========================================================
  // TERMÉK HOZZÁADÁSA A RENDELÉSHEZ
  // =========================================================

  const addToOrder = async () => {
    /*
     * NINCS KIVÁLASZTOTT TERMÉK
     */
    if (!liveProduct) {
      Notiflix.Notify.warning("Válassz ki egy terméket!");

      return;
    }

    /*
     * NINCS KIVÁLASZTOTT ASZTAL
     */
    if (selectedTable < 1) {
      Notiflix.Notify.warning("Először válassz asztalt!");

      return;
    }

    /*
     * ELFOGYOTT
     */
    if (stock <= 0) {
      Notiflix.Notify.failure("A kiválasztott termék elfogyott.");

      return;
    }

    /*
     * TÚL NAGY MENNYISÉG
     */
    if (count > stock) {
      Notiflix.Notify.failure("A választott mennyiség meghaladja a készletet.");

      return;
    }

    try {
      /*
       * FIRESTORE TERMÉK
       */
      const productRef = doc(db, "kunpaosproducts", liveProduct.id);

      /*
       * ÚJ RENDELÉSI TÉTEL
       */
      const tableOrderRef = doc(collection(db, TABLE_ORDERS));

      /*
       * ATOMIKUS FIRESTORE TRANZAKCIÓ
       */
      await runTransaction(db, async (transaction) => {
        /*
         * FRISS TERMÉKADAT LEKÉRÉSE
         */
        const productSnapshot = await transaction.get(productRef);

        if (!productSnapshot.exists()) {
          throw new Error("A termék már nem található.");
        }

        const productData = productSnapshot.data();

        /*
         * AKTUÁLIS FIRESTORE KÉSZLET
         */
        const currentStock = Number(productData.stock || 0);

        /*
         * IDŐKÖZBEN ELFOGYOTT
         */
        if (currentStock <= 0) {
          throw new Error(
            `A(z) ${productData.name || "termék"} időközben elfogyott.`,
          );
        }

        /*
         * IDŐKÖZBEN VALAKI MÁS ELHASZNÁLTA
         * A KÉSZLETET
         */
        if (count > currentStock) {
          throw new Error(
            `A(z) ${
              productData.name || "termék"
            } készletéből csak ${currentStock} db maradt.`,
          );
        }

        /*
         * KÉSZLET CSÖKKENTÉSE
         */
        transaction.update(productRef, {
          stock: currentStock - count,
        });

        /*
         * RENDELÉSI TÉTEL ELMENTÉSE
         */
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

          /*
           * Ezt használjuk később a készlet
           * visszaadásához törléskor.
           */
          productId: liveProduct.id,
        });
      });

      // =========================================================
      // SIKERES RENDELÉS
      // =========================================================

      setCount(1);

      /*
       * Az összes termék jelenjen meg
       */
      showAllProducts();

      /*
       * A kiválasztott termék törlése
       */
      dispatch(CLEAR_SELECTEDPRODUCT());

      /*
       * A vizuálisan kijelölt asztal
       * sárga kijelölésének megszüntetése
       */
      if (onOrderAdded) {
        onOrderAdded();
      }

      Notiflix.Notify.success("Rendelés hozzáadva!");
    } catch (error) {
      console.error("Add order / stock transaction error:", error);

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
          {/* ÖSSZES */}

          <button
            type="button"
            className={`tableProductSelector__category ${
              selectedCategory === ALL_CATEGORIES
                ? "tableProductSelector__category--active"
                : ""
            }`}
            onClick={() => filterProducts(ALL_CATEGORIES)}
          >
            <span>
              <Icon name="coffee" size={13} />
            </span>
            Összes
          </button>

          {/* KATEGÓRIÁK */}

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
              <Icon name="coffee" size={26} />

              <h3>Nincs megjeleníthető termék</h3>

              <p>Válassz egy másik kategóriát.</p>
            </div>
          ) : (
            filteredProducts.map((item) => {
              const itemStock = Number(item?.stock || 0);

              const isOutOfStock = itemStock <= 0;

              const isSelected = selectedProduct?.id === item.id;

              const isLowStock =
                itemStock > 0 && itemStock <= Number(item?.minStock || 0);

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={isOutOfStock}
                  className={`tableProductSelector__product ${
                    isSelected ? "tableProductSelector__product--selected" : ""
                  } ${
                    isOutOfStock
                      ? "tableProductSelector__product--disabled"
                      : ""
                  }`}
                  onClick={() => selectProduct(item)}
                >
                  {/* KÉP */}

                  <div className="tableProductSelector__productImage">
                    {item.imageURL ? (
                      <img src={item.imageURL} alt={item.name || "Termék"} />
                    ) : (
                      <Icon name="coffee" size={20} />
                    )}
                  </div>

                  {/* ADATOK */}

                  <div className="tableProductSelector__productInfo">
                    <strong>{item.name}</strong>

                    <span>
                      {Number(item.price || 0).toLocaleString("hu-HU")} Ft
                    </span>

                    <small>
                      {isOutOfStock
                        ? "Elfogyott"
                        : isLowStock
                          ? `Alacsony készlet • ${itemStock} db`
                          : `${itemStock} db készleten`}
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
            <div>
              <Icon name="coffee" size={20} />
            </div>

            <p>Válassz egy terméket a fenti listából.</p>
          </div>
        ) : (
          <div className="tableProductSelector__selectedContent">
            {/* =================================================
                KÉP
               ================================================= */}

            <div className="tableProductSelector__selectedImage">
              {liveProduct.imageURL ? (
                <img
                  src={liveProduct.imageURL}
                  alt={liveProduct.name || "Termék"}
                />
              ) : (
                <Icon name="coffee" size={30} />
              )}
            </div>

            {/* =================================================
                TERMÉKADATOK
               ================================================= */}

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
                <Icon
                  name={
                    stock <= Number(liveProduct.minStock || 0)
                      ? "alert"
                      : "check"
                  }
                  size={13}
                />

                {stock <= 0
                  ? "Elfogyott"
                  : stock <= Number(liveProduct.minStock || 0)
                    ? `Alacsony készlet • ${stock} db`
                    : `Készleten • ${stock} db`}
              </div>
            </div>

            {/* =================================================
                MENNYISÉG / HOZZÁADÁS
               ================================================= */}

            <div className="tableProductSelector__controls">
              <div className="tableProductSelector__amount">
                <button
                  type="button"
                  onClick={decrease}
                  disabled={count <= 1 || stock <= 0}
                  aria-label="Mennyiség csökkentése"
                >
                  <Icon name="minus" size={16} />
                </button>

                <strong>{count}</strong>

                <button
                  type="button"
                  onClick={increase}
                  disabled={stock <= 0 || count >= stock}
                  aria-label="Mennyiség növelése"
                >
                  <Icon name="plus" size={16} />
                </button>
              </div>

              <span className="tableProductSelector__subtotal">
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
                <Icon name="plus" size={16} />
                Hozzáad a rendeléshez
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default TableProductSelector;
