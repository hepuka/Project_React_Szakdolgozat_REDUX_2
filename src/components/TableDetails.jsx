import { useEffect, useState } from "react";

import "./TableDetails.scss";

import { useSelector } from "react-redux";

import { selectTableOrders } from "../Redux/slice/tableSlice";

const TableDetails = ({ sendTableId }) => {
  const [selTable, setSelTable] = useState(0);

  const orderNumbers = useSelector(selectTableOrders);

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const currentDate = time.toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const currentTime = time.toLocaleTimeString("hu-HU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="placeorder__card placeorder__tablenumber">
      <div className="tableDetails__header">
        <div>
          <span>Asztalok</span>

          <h2>Aktív asztal {selTable ? `#${selTable}` : "—"}</h2>
        </div>

        <div className="tableDetails__clock">
          <strong>{currentDate}</strong>
          <strong>{currentTime}</strong>
        </div>
      </div>

      <div className="tableDetails__legend">
        <span>
          <i className="tableDetails__legendDot tableDetails__legendDot--free" />
          Szabad
        </span>

        <span>
          <i className="tableDetails__legendDot tableDetails__legendDot--busy" />
          Foglalt
        </span>
      </div>

      <div className="tableDetails__buttons">
        {Array(10)
          .fill(null)
          .map((_, i) => {
            const tableNumber = i + 1;

            const productCount = Number(orderNumbers?.[i] || 0);

            const isSelected = selTable === tableNumber;

            const isBusy = productCount > 0;

            return (
              <button
                key={tableNumber}
                type="button"
                className={`tableDetails__table ${
                  isSelected ? "tableDetails__table--selected" : ""
                } ${
                  isBusy
                    ? "tableDetails__table--busy"
                    : "tableDetails__table--free"
                }`}
                onClick={() => {
                  sendTableId(tableNumber);
                  setSelTable(tableNumber);
                }}
              >
                <strong>{String(tableNumber).padStart(2, "0")}</strong>

                <span>asztal</span>

                {isBusy && <small>{productCount} tétel</small>}
              </button>
            );
          })}
      </div>
    </div>
  );
};

export default TableDetails;
