import "./Placeorder.scss";
import Layout from "../../components/Layout";

import { useSelector } from "react-redux";
import { selectUserName } from "../../Redux/slice/authSlice";

import TableDetails from "../../components/TableDetails";
import TableProductSelector from "../../components/TableProductSelector";
import TableOrders from "../../components/TableOrders";
import TablePayment from "../../components/TablePayment";

import { useEffect, useState } from "react";

import { collection, query, onSnapshot, orderBy } from "firebase/firestore";

import { db } from "../../firebase/config";

const Placeorder = () => {
  const userName = useSelector(selectUserName);

  // Az asztal, amelyhez ténylegesen a rendelés tartozik
  const [selectedTable, setSelectedTable] = useState(0);

  // Az asztal, amely vizuálisan legyen sárgával kijelölve
  const [highlightedTable, setHighlightedTable] = useState(0);

  const [tableOrders, setTableOrders] = useState([]);

  useEffect(() => {
    const ordersRef = collection(db, `tableorders_${selectedTable}`);

    const ordersQuery = query(ordersRef, orderBy("createdAt"));

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const allData = snapshot.docs.map((item) => ({
          id: item.data().id ?? item.id,

          documentId: item.id,

          ...item.data(),
        }));

        setTableOrders(allData);
      },
      (error) => {
        console.error("Table orders listener error:", error);

        setTableOrders([]);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [selectedTable]);

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
          />

          <TableProductSelector
            selectedTable={selectedTable}
            tableOrdersLength={tableOrders.length}
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
