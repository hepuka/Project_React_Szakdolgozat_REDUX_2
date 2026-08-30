import "./TableOrders.scss";

import Notiflix from "notiflix";

import {
  collection,
  doc,
  query,
  getDocs,
  where,
  runTransaction,
} from "firebase/firestore";

import { db } from "../firebase/config";

import { SET_DELETETABLESORDERS } from "../Redux/slice/tableSlice";

import { useDispatch } from "react-redux";

const TableOrders = ({ getTotal, selectedTable, tableOrders }) => {
  const dispatch = useDispatch();

  // =========================================================
  // REDUX - ASZTAL TÉTELSZÁM FRISSÍTÉSE
  // =========================================================

  const decrElement = () => {
    dispatch(
      SET_DELETETABLESORDERS({
        id: selectedTable,
      }),
    );
  };

  // =========================================================
  // RENDELÉSI TÉTEL TÖRLÉSE + KÉSZLET VISSZAADÁSA
  // =========================================================

  const deleteOrder = async (productId) => {
    const ordersRef = collection(db, `tableorders_${selectedTable}`);

    const ordersQuery = query(ordersRef, where("id", "==", productId));

    const querySnapshot = await getDocs(ordersQuery);

    if (querySnapshot.empty) {
      throw new Error("A rendelési tétel nem található.");
    }

    const orderDocument = querySnapshot.docs[0];

    const orderDocumentId = orderDocument.id;

    const orderData = orderDocument.data();

    // =======================================================
    // A korábbi rendeléseknél lehet, hogy még nincs productId.
    // =======================================================

    if (!orderData.productId) {
      throw new Error(
        "A rendelési tételhez nem tartozik termékazonosító. A készletet nem lehet automatikusan visszaállítani.",
      );
    }

    const productIdFromOrder = orderData.productId;

    const amount = Number(orderData.amount || 0);

    if (amount <= 0) {
      throw new Error("A rendelési mennyiség érvénytelen.");
    }

    const productRef = doc(db, "kunpaosproducts", productIdFromOrder);

    const tableOrderRef = doc(
      db,
      `tableorders_${selectedTable}`,
      orderDocumentId,
    );

    // =======================================================
    // FIRESTORE TRANZAKCIÓ
    // =======================================================

    await runTransaction(db, async (transaction) => {
      const productSnapshot = await transaction.get(productRef);

      if (!productSnapshot.exists()) {
        throw new Error(
          "A kapcsolódó termék már nem található a termékek között.",
        );
      }

      const productData = productSnapshot.data();

      const currentStock = Number(productData.stock || 0);

      const newStock = currentStock + amount;

      // ---------------------------------------------------
      // KÉSZLET VISSZAÁLLÍTÁSA
      // ---------------------------------------------------

      transaction.update(productRef, {
        stock: newStock,
      });

      // ---------------------------------------------------
      // RENDELÉSI TÉTEL TÖRLÉSE
      // ---------------------------------------------------

      transaction.delete(tableOrderRef);
    });
  };

  // =========================================================
  // TÖRLÉS MEGERŐSÍTÉSE
  // =========================================================

  const confirmDelete = (product) => {
    Notiflix.Confirm.show(
      "Rendelési tétel törlése",
      `Biztosan törölni szeretnéd a(z) ${product.name} tételt?`,
      "Törlés",
      "Mégse",

      async () => {
        try {
          await deleteOrder(product.id);

          decrElement();

          getTotal();

          Notiflix.Notify.success(
            `${product.name} törölve. A készlet frissítve.`,
          );
        } catch (error) {
          console.error("Delete order / stock restore error:", error);

          Notiflix.Notify.failure(
            error.message || "Nem sikerült törölni a rendelési tételt.",
          );
        }
      },

      () => {},

      {
        width: "340px",
        borderRadius: "14px",
        titleColor: "#2c1e1a",
        okButtonBackground: "#b15252",
        cssAnimationStyle: "zoom",
      },
    );
  };

  return (
    <div className="placeorder__card placeorder__tableorders">
      <div className="tableOrders__header">
        <div>
          <span>Aktív rendelés</span>

          <h2>Asztal #{selectedTable}</h2>
        </div>

        <div className="tableOrders__count">{tableOrders.length} tétel</div>
      </div>

      <div className="tableOrders__list">
        {tableOrders.length === 0 ? (
          <div className="tableOrders__empty">
            <div>🧾</div>

            <h3>A rendelés üres</h3>

            <p>Válassz egy terméket a hozzáadáshoz.</p>
          </div>
        ) : (
          tableOrders.map((item) => (
            <article
              key={item.documentId || item.id}
              className="tableOrders__item"
            >
              <div className="tableOrders__itemMain">
                <div className="tableOrders__itemIcon">☕</div>

                <div className="tableOrders__itemInfo">
                  <strong>{item.name}</strong>

                  <span>
                    {item.amount} ×{" "}
                    {Number(item.price || 0).toLocaleString("hu-HU")} Ft
                  </span>
                </div>
              </div>

              <div className="tableOrders__itemRight">
                <strong>
                  {Number(item.sum || 0).toLocaleString("hu-HU")} Ft
                </strong>

                <button
                  type="button"
                  onClick={() => confirmDelete(item)}
                  aria-label={`${item.name} törlése`}
                  title="Tétel törlése"
                >
                  ×
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="tableOrders__summary">
        <span>Részösszeg</span>

        <strong>{Number(getTotal() || 0).toLocaleString("hu-HU")} Ft</strong>
      </div>
    </div>
  );
};

export default TableOrders;
