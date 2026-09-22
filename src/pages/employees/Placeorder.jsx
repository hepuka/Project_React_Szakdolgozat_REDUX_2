import "./Placeorder.scss";
import Layout from "../../components/Layout";

import { useSelector } from "react-redux";
import { selectUserName } from "../../Redux/slice/authSlice";

import TableDetails from "../../components/TableDetails";
import TableProductSelector from "../../components/TableProductSelector";
import TableOrders from "../../components/TableOrders";
import TablePayment from "../../components/TablePayment";

import { useEffect, useMemo, useState } from "react";

import { collection, query, onSnapshot, orderBy } from "firebase/firestore";

import { db } from "../../firebase/config";

import { TABLE_COUNT, TABLE_ORDERS } from "../../config/tables";

const Placeorder = () => {
  const userName = useSelector(selectUserName);

  // Az asztal, amelyhez ténylegesen a rendelés tartozik
  const [selectedTable, setSelectedTable] = useState(0);

  // Az asztal, amely vizuálisan legyen sárgával kijelölve
  const [highlightedTable, setHighlightedTable] = useState(0);

  /*
   * Minden asztal tételei egyetlen kollekcióból, egyetlen
   * figyelővel. Korábban asztalonként külön kollekció és
   * külön figyelő volt.
   */
  const [allTableOrders, setAllTableOrders] = useState([]);

  useEffect(() => {
    const ordersRef = collection(db, TABLE_ORDERS);

    const ordersQuery = query(ordersRef, orderBy("createdAt"));

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const allData = snapshot.docs.map((item) => ({
          id: item.data().id ?? item.id,

          documentId: item.id,

          ...item.data(),
        }));

        setAllTableOrders(allData);
      },
      (error) => {
        console.error("Table orders listener error:", error);

        setAllTableOrders([]);
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  /*
   * A kiválasztott asztal tételei.
   */
  const tableOrders = useMemo(() => {
    return allTableOrders.filter(
      (order) => Number(order?.tableNumber) === Number(selectedTable),
    );
  }, [allTableOrders, selectedTable]);

  /*
   * Asztalonkénti tételszám a foglaltság jelzéséhez.
   * Ez korábban a Reduxban, a localStorage-ban élt, és el
   * tudott csúszni az adatbázistól; most közvetlenül a
   * Firestore adataiból számoljuk.
   */
  const tableCounts = useMemo(() => {
    const counts = Array(TABLE_COUNT).fill(0);

    allTableOrders.forEach((order) => {
      const index = Number(order?.tableNumber) - 1;

      if (index >= 0 && index < counts.length) {
        counts[index] += 1;
      }
    });

    return counts;
  }, [allTableOrders]);

  const sendTableId = (id) => {
    // Tényleges aktív asztal
    setSelectedTable(id);

    // Vizuális kijelölés
    setHighlightedTable(id);
  };

  const clearTableHighlight = () => {
    setHighlightedTable(0);
  };

  const getTotal = () => {
    return tableOrders.reduce((sum, item) => sum + Number(item?.sum || 0), 0);
  };

  return (
    <Layout>
      <section className="placeorder">
        <header className="placeorder__header">
          <div>
            <span className="placeorder__eyebrow">POS / Order Management</span>

            <h1>Rendelés / Fizetés</h1>
          </div>

          <div className="placeorder__headerStatus">
            <span className="placeorder__statusDot" />

            <div>
              <strong>{userName || "Felhasználó"}</strong>
            </div>
          </div>
        </header>

        <div className="placeorder__workspace">
          <TableDetails
            selectedTable={highlightedTable}
            sendTableId={sendTableId}
            tableCounts={tableCounts}
          />

          <TableProductSelector
            selectedTable={selectedTable}
            onOrderAdded={clearTableHighlight}
          />

          <TableOrders
            getTotal={getTotal}
            selectedTable={selectedTable}
            tableOrders={tableOrders}
          />

          <TablePayment
            getTotal={getTotal}
            userName={userName}
            tableOrders={tableOrders}
            id={selectedTable}
          />
        </div>
      </section>
    </Layout>
  );
};

export default Placeorder;
