/* =========================================================
   IRÁNYÍTÓPULT - FŐ MUTATÓK
   ========================================================= */

import Icon from "../../../components/Icon";
import { formatCurrency } from "../../../services/financeCalculations";

import { ROLES } from "../../../config/permissions";

const DashboardStats = ({
  todayRevenue,
  todayOrders,
  averageOrder,
  products,
  criticalStockCount,
  outOfStockCount,
  currentUserRole,
  users,
  onlineUsers,
  selectedCurrentMoney,
  isSelectedPeriodClosed,
}) => {
  return (
    <section className="admin__stats">
      <article className="admin__statCard">
        <div className="admin__statTop">
          <div className="admin__statIcon">
            <Icon name="chart" size={18} />
          </div>

          <span className="admin__statCaption">Mai bevétel</span>
        </div>

        <strong className="admin__statValue">
          {formatCurrency(todayRevenue)} Ft
        </strong>

        <span className="admin__statMeta">
          {todayOrders.length} rendelés
        </span>
      </article>

      <article className="admin__statCard">
        <div className="admin__statTop">
          <div className="admin__statIcon">
            <Icon name="receipt" size={18} />
          </div>

          <span className="admin__statCaption">Mai rendelések</span>
        </div>

        <strong className="admin__statValue">{todayOrders.length}</strong>

        <span className="admin__statMeta">
          Átlag: {formatCurrency(averageOrder)} Ft
        </span>
      </article>

      <article className="admin__statCard">
        <div className="admin__statTop">
          <div className="admin__statIcon">
            <Icon name="coffee" size={18} />
          </div>

          <span className="admin__statCaption">Termékek</span>
        </div>

        <strong className="admin__statValue">{products.length}</strong>

        <span className="admin__statMeta">
          {criticalStockCount} kritikus · {outOfStockCount} elfogyott
        </span>
      </article>

      {/* ===============================================
          ADMINNÁL FELHASZNÁLÓK
         =============================================== */}

      {currentUserRole === ROLES.ADMIN ? (
        <article className="admin__statCard">
          <div className="admin__statTop">
            <div className="admin__statIcon">
              <Icon name="users" size={18} />
            </div>

            <span className="admin__statCaption">Felhasználók</span>
          </div>

          <strong className="admin__statValue">{users.length}</strong>

          <span className="admin__statMeta">
            {onlineUsers.length} online
          </span>
        </article>
      ) : (
        <article className="admin__statCard admin__statCard--money">
          <div className="admin__statTop">
            <div className="admin__statIcon">
              <Icon name="wallet" size={18} />
            </div>

            <span className="admin__statCaption">Kávézó pénze</span>
          </div>

          <strong className="admin__statValue">
            {formatCurrency(selectedCurrentMoney)} Ft
          </strong>

          <span className="admin__statMeta">
            <Icon
              name={isSelectedPeriodClosed ? "lock" : "check"}
              size={13}
            />
            {isSelectedPeriodClosed ? "Hónap lezárva" : "Nyitott hónap"}
          </span>
        </article>
      )}
    </section>
  );
};

export default DashboardStats;
