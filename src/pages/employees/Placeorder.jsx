import "./Placeorder.scss";
import Layout from "../../components/Layout";
import { useSelector } from "react-redux";
import { selectUserName } from "../../Redux/slice/authSlice";

import TableDetails from "../../components/TableDetails";
import TableButtons from "../../components/TableButtons";
import TableProducts from "../../components/TableProducts";
import TableProductDetailsContainer from "../../components/TableProductDetailsContainer";
import TableOrders from "../../components/TableOrders";
import TablePayment from "../../components/TablePayment";
import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../firebase/config";

const Placeorder = () => {
  const userName = useSelector(selectUserName);
  const [selectedTable, setSelectedTable] = useState(0);
  const [tableOrders, setTableOrders] = useState([]);
  const [orderNumber, setOrderNumber] = useState(0);

  useEffect(() => {
    const docRef = collection(db, `tableorders_${selectedTable}`);
    const q = query(docRef, orderBy("createdAt"));

    onSnapshot(q, (snapshot) => {
      const allData = snapshot.docs.map((item) => ({
        id: item.selectedTable,
        ...item.data(),
      }));

      setTableOrders(allData);
    });
  }, [selectedTable]);

  const sendTableId = (id) => {
    setSelectedTable(id);
  };

  const getTotal = () => {
    let summ = 0;
    tableOrders.map((item) => {
      return (summ += item.sum);
    });

    return summ;
  };

  return (
    <Layout>
      <div className="placeorder">
        <TableDetails
          id={selectedTable}
          userName={userName}
          sendTableId={sendTableId}
        />

        <TableButtons />

        <TableProducts />

        <TableProductDetailsContainer
          selectedTable={selectedTable}
          tableOrdersLength={tableOrders.length}
          setOrderNumber={setOrderNumber}
        />

        <TableOrders
          getTotal={getTotal}
          id={selectedTable}
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
    </Layout>
  );
};

export default Placeorder;
