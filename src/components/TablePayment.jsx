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

  const [pin, setPin] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const total = Number(getTotal() || 0);

  const tax = Math.ceil(total * 0.05);

  const finalAmount = total + tax;

  const saveOrder = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    if (Number(id) < 1) {
      Notiflix.Notify.warning("Először válassz asztalt!");

      return;
    }

    if (!tableOrders.length) {
      Notiflix.Notify.warning("A rendelés üres.");

      return;
    }

    if (pin !== userPin) {
      Notiflix.Notify.failure("Hibás PIN kód.");

      return;
    }

    setLoading(true);

    const today = new Date();

    const orderConfig = {
      user: userEmail,

      username: userName,

      orderDate: today.toLocaleDateString("hu-HU"),

      orderTime: today.toLocaleTimeString("hu-HU", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),

      orderAmount: finalAmount,

      orderStatus: "Fizetve",

      tablenumber: Number(id),

      cartItems: tableOrders,

      createdAt: Timestamp.now().toDate(),
    };

    try {
      await addDoc(collection(db, "kunpaosorders"), orderConfig);

      const tableOrdersRef = collection(db, `tableorders_${id}`);

      const snapshot = await getDocs(query(tableOrdersRef));

      await Promise.all(
        snapshot.docs.map((order) =>
          deleteDoc(doc(db, `tableorders_${id}`, order.id)),
        ),
      );

      dispatch(
        SET_ZERO({
          id: Number(id),
        }),
      );

      setPin("");

      Notiflix.Notify.success("Rendelés fizetve!");

      navigate("/tables");
    } catch (error) {
      console.error("Payment error:", error);

      Notiflix.Notify.failure("Nem sikerült rögzíteni a fizetést.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="placeorder__card placeorder__tablepayment">
      <div className="tablePayment__header">
        <div>
          <span>Fizetés</span>

          <h2>Rendelés összesítése</h2>
        </div>

        <div className="tablePayment__table">#{id || ""}</div>
      </div>

      <div className="tablePayment__details">
        <div>
          <span>Részösszeg</span>

          <strong>{total.toLocaleString("hu-HU")} Ft</strong>
        </div>

        <div>
          <span>ÁFA</span>

          <strong>5%</strong>
        </div>

        <div className="tablePayment__total">
          <span>Végösszeg</span>

          <strong>{finalAmount.toLocaleString("hu-HU")} Ft</strong>
        </div>
      </div>

      <form className="tablePayment__form" onSubmit={saveOrder}>
        <div className="tablePayment__pin">
          <label htmlFor="payment-pin">PIN kód</label>

          <input
            id="payment-pin"
            type="password"
            value={pin}
            placeholder="••••"
            inputMode="numeric"
            maxLength={4}
            required
            disabled={loading}
            onChange={(e) => setPin(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading || !tableOrders.length}>
          {loading ? (
            <>
              <span className="tablePayment__spinner" />
              Feldolgozás...
            </>
          ) : (
            <>✓ Fizetés lezárása</>
          )}
        </button>
      </form>
    </div>
  );
};

export default TablePayment;
