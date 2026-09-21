/* =========================================================
   IRÁNYÍTÓPULT - ASZTALOK
   ========================================================= */

import { Link } from "react-router-dom";

import { formatCurrency } from "../../../services/financeCalculations";

const TablesPanel = ({ tables, tableStats }) => {
  return (
    <article className="admin__panel">
      <div className="admin__panelHeader">
        <div>
          <span className="admin__panelEyebrow">Élő állapot</span>

          <h2>Asztalok</h2>
        </div>

        <Link to="/tables" className="admin__panelLink">
          Megnyitás
        </Link>
      </div>

      <div className="admin__tableSummary">
        <div className="admin__tableSummaryItem">
          <span className="admin__greenDot" />

          <strong>{tableStats.free.length}</strong>

          <small>szabad</small>
        </div>

        <div className="admin__tableSummaryItem">
          <span className="admin__yellowDot" />

          <strong>{tableStats.busy.length}</strong>

          <small>foglalt</small>
        </div>
      </div>

      <div className="admin__tablesGrid">
        {tables.map((table) => {
          const busy = table.orders.length > 0;

          const total = table.orders.reduce(
            (sum, item) => sum + Number(item?.sum || 0),
            0,
          );

          return (
            <Link
              key={table.number}
              to="/tables"
              className={
                busy
                  ? "admin__tableMini admin__tableMini--busy"
                  : "admin__tableMini admin__tableMini--free"
              }
            >
              <strong>{String(table.number).padStart(2, "0")}</strong>

              <span>asztal</span>

              {busy && <small>{formatCurrency(total)} Ft</small>}
            </Link>
          );
        })}
      </div>
    </article>
  );
};

export default TablesPanel;
