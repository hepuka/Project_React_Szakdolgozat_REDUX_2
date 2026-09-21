/* =========================================================
   IRÁNYÍTÓPULT - ÖSSZEGZŐ LÁBLÉC
   ========================================================= */

import { formatCurrency } from "../../../services/financeCalculations";

const DashboardFooter = ({ selectedMonthlyResult, selectedMonthPendingExpenses }) => {
  return (
    <footer className="admin__footerSummary">
      <div>
        <span>Havi eredmény</span>

        <strong
          className={
            selectedMonthlyResult >= 0
              ? "admin__financePositive"
              : "admin__financeNegative"
          }
        >
          {selectedMonthlyResult >= 0 ? "+" : "−"}{" "}
          {formatCurrency(Math.abs(selectedMonthlyResult))} Ft
        </strong>
      </div>

      <div>
        <span>Rendezetlen kiadások</span>

        <strong>{formatCurrency(selectedMonthPendingExpenses)} Ft</strong>
      </div>

      <div>
        <span>Rendszer állapota</span>

        <strong className="admin__systemOnline">
          <span className="admin__systemOnlineDot" />
          Minden rendszer aktív
        </strong>
      </div>
    </footer>
  );
};

export default DashboardFooter;
