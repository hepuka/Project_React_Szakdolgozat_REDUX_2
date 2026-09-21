/* =========================================================
   IRÁNYÍTÓPULT - HAVI PÉNZÜGYEK
   ========================================================= */

import { Link } from "react-router-dom";

import {
  formatCurrency,
  formatPeriod,
} from "../../../services/financeCalculations";

const FinancePanel = ({
  selectedPeriod,
  selectedStartingBalance,
  selectedMonthRevenue,
  selectedMonthPurchases,
  selectedMonthPaidExpenses,
  selectedCurrentMoney,
}) => {
  return (
    <article className="admin__panel admin__panel--finance">
      <div className="admin__panelHeader">
        <div>
          <span className="admin__panelEyebrow">Pénzügyek</span>

          <h2>{formatPeriod(selectedPeriod)}</h2>
        </div>

        <Link to="/business" className="admin__panelLink">
          Részletek
        </Link>
      </div>

      <div className="admin__financeRows">
        <div>
          <span>Kezdő pénzkészlet</span>

          <strong>{formatCurrency(selectedStartingBalance)} Ft</strong>
        </div>

        <div>
          <span>Havi bevétel</span>

          <strong className="admin__financePositive">
            + {formatCurrency(selectedMonthRevenue)} Ft
          </strong>
        </div>

        <div>
          <span>Beszerzések</span>

          <strong className="admin__financeNegative">
            − {formatCurrency(selectedMonthPurchases)} Ft
          </strong>
        </div>

        <div>
          <span>Rendezett kiadások</span>

          <strong className="admin__financeNegative">
            − {formatCurrency(selectedMonthPaidExpenses)} Ft
          </strong>
        </div>
      </div>

      <div className="admin__financeBalance">
        <span>Jelenlegi pénz</span>

        <strong>{formatCurrency(selectedCurrentMoney)} Ft</strong>
      </div>
    </article>
  );
};

export default FinancePanel;
