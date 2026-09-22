import { useState } from "react";

import "./TablePayment.scss";

import { useNavigate } from "react-router-dom";

import { useSelector } from "react-redux";

import {
  selectCurrentUserId,
  selectEmail,
} from "../Redux/slice/authSlice";

import { db } from "../firebase/config";

import Notiflix from "notiflix";

import {
  addDoc,
  collection,
  Timestamp,
  deleteDoc,
  doc,
  getDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { TABLE_ORDERS } from "../config/tables";

import Icon from "./Icon";

const TablePayment = ({ getTotal, userName, tableOrders, id }) => {
  const currentUserId = useSelector(selectCurrentUserId);

  const userEmail = useSelector(selectEmail);

  const [pin, setPin] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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

    if (!currentUserId) {
      Notiflix.Notify.failure("Nem található a bejelentkezett felhasználó.");

      return;
    }

    setLoading(true);

    try {
      /*
       * A PIN kódot az adatbázisból ellenőrizzük.
       *
       * Korábban a Redux állapotból jött, amit a redux-persist
       * a localStorage-ba is kiírt - így a böngészőből
       * kiolvasható volt.
       */

      const profileSnapshot = await getDoc(doc(db, "users", currentUserId));

      const storedPin = profileSnapshot.exists()
        ? String(profileSnapshot.data()?.pin ?? "")
        : "";

      if (!storedPin || pin !== storedPin) {
        Notiflix.Notify.failure("Hibás PIN kód.");

        return;
      }

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

      await addDoc(collection(db, "kunpaosorders"), orderConfig);

      /*
       * Az asztal tételeinek törlése a közös kollekcióból.
       */
      const tableOrdersQuery = query(
        collection(db, TABLE_ORDERS),
        where("tableNumber", "==", Number(id)),
      );

      const snapshot = await getDocs(tableOrdersQuery);

      await Promise.all(
        snapshot.docs.map((order) =>
          deleteDoc(doc(db, TABLE_ORDERS, order.id)),
        ),
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
            <>
                <Icon name="check" size={16} />
                Fizetés lezárása
              </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TablePayment;
