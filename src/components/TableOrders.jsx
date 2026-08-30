import "./TableOrders.scss";

import Notiflix from "notiflix";

import {
  collection,
  deleteDoc,
  doc,
  query,
  getDocs,
  where,
} from "firebase/firestore";

import { db } from "../firebase/config";

import { SET_DELETETABLESORDERS } from "../Redux/slice/tableSlice";

import { useDispatch } from "react-redux";

const TableOrders = ({ getTotal, selectedTable, tableOrders }) => {
  const dispatch = useDispatch();

  const decrElement = () => {
    dispatch(
      SET_DELETETABLESORDERS({
        id: selectedTable,
      }),
    );
  };

  const deleteOrder = async (productId) => {
    const ordersRef = collection(db, `tableorders_${selectedTable}`);

    const ordersQuery = query(ordersRef, where("id", "==", productId));

    const querySnapshot = await getDocs(ordersQuery);

    if (querySnapshot.empty) {
      throw new Error("A rendelési tétel nem található.");
    }

    const documentId = querySnapshot.docs[0].id;

    await deleteDoc(doc(db, `tableorders_${selectedTable}`, documentId));
  };

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

          Notiflix.Notify.success("Termék törölve a rendelésből!");
        } catch (error) {
          console.error("Delete order item error:", error);

          Notiflix.Notify.failure("Nem sikerült törölni a rendelési tételt.");
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
