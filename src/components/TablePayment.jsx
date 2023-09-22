import React, { useState } from "react";
import "./TablePayment.scss";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectUserPin, selectEmail } from "../Redux/slice/authSlice";
import { db } from "../firebase/config";
import Notiflix from "notiflix";
import {
  addDoc,
  collection,
  Timestamp,
  deleteDoc,
  doc,
  query,
  getDocs,
} from "firebase/firestore";
import { SET_ZERO } from "../Redux/slice/tableSlice";

const TablePayment = ({ getTotal, userName, tableOrders, id }) => {
  const userPin = useSelector(selectUserPin);
  const userEmail = useSelector(selectEmail);
  const today = new Date();
  const date = today.toDateString();
  const time = today.toLocaleTimeString();
  const [pin, setPin] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const orderConfig = {
    user: userEmail,
    username: userName,
    orderDate: date,
    orderTime: time,
    orderAmount: Math.ceil(getTotal() * 1.05),
    orderStatus: "Fizetve",
    tablenumber: id,
    cartItems: tableOrders,
    createdAt: Timestamp.now().toDate(),
  };

  const saveOrder = async (e) => {
    e.preventDefault();

    if (pin !== userPin) {
      Notiflix.Notify.failure("Hibás pin kód");
    } else {
      addDoc(collection(db, "kunpaosorders"), orderConfig);

      const docRef = query(collection(db, `tableorders_${id}`));
      const toDelete = await getDocs(docRef);

      toDelete.forEach((item) => {
        const ID = item.id;
        deleteDoc(doc(db, `tableorders_${id}`, ID));
      });

      Notiflix.Notify.success("Rendelés fizetve!");
      navigate("/tables");
    }

    dispatch(SET_ZERO({ id: id }));

    setPin("");
  };

  return (
    <div className="placeorder__card placeorder__tablepayment">
      <div className="placeorder__tablepaymentdetails">
        <h2>
          Összeg: <span>{getTotal()} Ft</span>
        </h2>
        <h2>
          Adó: <span>5%</span>
        </h2>
        <h2>
          Végösszeg: <span>{Math.ceil(getTotal() * 1.05)} Ft</span>
        </h2>
      </div>
      <div className="placeorder__tablepayment__button">
        <form onSubmit={saveOrder}>
          <input
            type="text"
            value={pin}
            placeholder="PIN kód"
            required
            onChange={(e) => setPin(e.target.value)}
          />
          <button type="submit">Fizetés</button>
        </form>
      </div>
    </div>
  );
};

export default TablePayment;
