import React, { useEffect, useState } from "react";
import "./TableDetails.scss";
import { useSelector } from "react-redux";
import { selectTableOrders } from "../Redux/slice/tableSlice";

const TableDetails = ({ sendTableId }) => {
  const [selTable, setSelTable] = useState("");
  const orderNumbers = useSelector(selectTableOrders);
  const [date, setDate] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    let timer = setInterval(
      () => setDate(new Date().toLocaleTimeString()),
      1000
    );
    return function cleanup() {
      clearInterval(timer);
    };
  });

  return (
    <div className="placeorder__card placeorder__tablenumber">
      <h1>Aktív asztal: {selTable} </h1>
      <div className="placeorder__time">
        <h2>{new Date().toLocaleDateString()}</h2>
        <h2>{date}</h2>
      </div>

      <div className="placerorder__buttons">
        {Array(10)
          .fill()
          .map((_, i) => (
            <div
              key={i}
              className={`placeorder__button ${
                orderNumbers[i] > 0 ? "reserved" : ""
              }`}
              onClick={() => {
                sendTableId(i + 1);
                setSelTable(i + 1);
              }}
            >
              {i + 1}. asztal{" "}
              <p>
                {" "}
                {`${orderNumbers[i] !== 0 ? orderNumbers[i] + " termék" : ""}`}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default TableDetails;
