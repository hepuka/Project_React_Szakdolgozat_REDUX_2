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

  const decrElement = async () => {
    dispatch(SET_DELETETABLESORDERS({ id: selectedTable }));
  };

  const confirmDelete = (productid) => {
    Notiflix.Confirm.show(
      "Rendelés törlése!",
      "Valóban törölni akarja a rendelést?",
      "Törlés",
      "Mégse",

      function okCb() {
        deleteOrder(productid);
        decrElement();
      },

      function cancelCb() {
        console.log("Törlés elutasítva!");
      },
      {
        width: "320px",
        borderRadius: "8px",
        titleColor: "red",
        okButtonBackground: "red",
        cssAnimationStyle: "zoom",
      }
    );
  };

  const deleteOrder = async (productid) => {
    const q = query(
      collection(db, `tableorders_${selectedTable}`),
      where("id", "==", productid)
    );

    const querySnapshot = await getDocs(q);
    const deletedProduct = querySnapshot.docs[0]._key.path.segments[6];

    const docRef = doc(db, `tableorders_${selectedTable}`, deletedProduct);

    deleteDoc(docRef).then(() => {
      getTotal();
      Notiflix.Notify.success("Termék törölve a rendelésből!");
    });
  };

  return (
    <div className="placeorder__card placeorder__tableorders">
      <div className="placeorder__tableordersdetails">
        <div className="placeorder__tableordersdetailsimg">
          <img
            src="https://freesvg.org/img/1667812423coffee-shop-logo-concept.png"
            alt="coffe_logo"
          />
        </div>
        <div className="placeorder__tableordersdetailstitle">
          <h2>KunPao's Coffee Management</h2>
        </div>
        <div className="placeorder__tableordersdetailsList">
          {tableOrders.map((item) => {
            return (
              <div
                key={item.createdAt}
                onClick={() => confirmDelete(item.id)}
                className="placeorder__tableordersdetails"
              >
                <div className="placeorder__tableordersdetail">
                  <p>Megnevezés:</p>
                  <p>{item.name}</p>
                </div>
                <div className="placeorder__tableordersdetail">
                  <p>Egységár:</p>
                  <p>{item.price} Ft</p>
                </div>
                <div className="placeorder__tableordersdetail">
                  <p>Mennyiség:</p>
                  <p>{item.amount}</p>
                </div>
                <div className="placeorder__tableordersdetail">
                  <p>Összeg:</p>
                  <p>{item.sum} Ft</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TableOrders;
