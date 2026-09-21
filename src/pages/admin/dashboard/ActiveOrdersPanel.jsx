/* =========================================================
   IRÁNYÍTÓPULT - AKTÍV ASZTALI RENDELÉSEK
   ========================================================= */

import { Link } from "react-router-dom";

import Icon from "../../../components/Icon";

import {
  formatCurrency,
  formatTime,
} from "../../../services/financeCalculations";

const ActiveOrdersPanel = ({ activeOrders }) => {
  return (
    <article className="admin__panel">
      <div className="admin__panelHeader">
        <div>
          <span className="admin__panelEyebrow">Élő rendelések</span>

          <h2>Aktív rendelések</h2>
        </div>

        <span className="admin__panelBadge">
          {activeOrders.length} aktív
        </span>
      </div>

      {activeOrders.length === 0 ? (
        <div className="admin__emptySmall">
          <Icon name="check" size={22} />

          <p>Jelenleg nincs aktív asztali rendelés.</p>
        </div>
      ) : (
        <div className="admin__activeOrderList">
          {activeOrders.slice(0, 5).map((order) => (
            <Link
              key={order.tableNumber}
              to="/tables"
              className="admin__activeOrderRow"
            >
              <div className="admin__activeOrderTable">
                #{order.tableNumber}
              </div>

              <div className="admin__activeOrderInfo">
                <strong>Asztal {order.tableNumber}</strong>

                <span>{order.itemCount} tétel</span>
              </div>

              <div className="admin__activeOrderAmount">
                <strong>{formatCurrency(order.total)} Ft</strong>

                <small>{formatTime(order.latestOrder?.createdAt)}</small>
              </div>
            </Link>
          ))}
        </div>
      )}
    </article>
  );
};

export default ActiveOrdersPanel;
