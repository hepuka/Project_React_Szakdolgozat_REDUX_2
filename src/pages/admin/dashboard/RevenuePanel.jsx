/* =========================================================
   IRÁNYÍTÓPULT - 7 NAPOS FORGALOM
   ========================================================= */

import { formatCurrency } from "../../../services/financeCalculations";

const RevenuePanel = ({
  last7Days,
  maxDailyRevenue,
  maxDailyOrders,
  chartMode,
  onChartModeChange,
}) => {
  return (
    <article className="admin__panel admin__panel--revenue">
      <div className="admin__panelHeader">
        <div>
          <span className="admin__panelEyebrow">Utóbbi 7 nap</span>

          <h2>Forgalom alakulása</h2>
        </div>

        <div className="admin__chartSwitch">
          <button
            type="button"
            className={
              chartMode === "revenue"
                ? "admin__chartSwitchButton admin__chartSwitchButton--active"
                : "admin__chartSwitchButton"
            }
            onClick={() => onChartModeChange("revenue")}
          >
            Bevétel
          </button>

          <button
            type="button"
            className={
              chartMode === "orders"
                ? "admin__chartSwitchButton admin__chartSwitchButton--active"
                : "admin__chartSwitchButton"
            }
            onClick={() => onChartModeChange("orders")}
          >
            Rendelések
          </button>
        </div>
      </div>

      <div className="admin__revenueChart">
        <div className="admin__revenueBars">
          {last7Days.map((day) => {
            const value =
              chartMode === "revenue" ? day.amount : day.orders;

            const maxValue =
              chartMode === "revenue" ? maxDailyRevenue : maxDailyOrders;

            const height =
              value > 0 ? Math.max((value / maxValue) * 100, 8) : 3;

            return (
              <div
                key={day.shortDate}
                className="admin__revenueDay"
                title={
                  chartMode === "revenue"
                    ? `${day.shortDate} • ${formatCurrency(
                        day.amount,
                      )} Ft`
                    : `${day.shortDate} • ${day.orders} rendelés`
                }
              >
                <div className="admin__revenueBarWrap">
                  <div
                    className="admin__revenueBar"
                    style={{
                      height: `${height}%`,
                    }}
                  />
                </div>

                <span>{day.shortDate}</span>

                <small>{day.label.replace(".", "")}</small>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
};

export default RevenuePanel;
