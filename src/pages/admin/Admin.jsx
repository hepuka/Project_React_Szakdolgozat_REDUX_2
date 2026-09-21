/* =========================================================
   IRÁNYÍTÓPULT (FŐOLDAL)
   =========================================================

   Ez a fájl csak összerakja az oldalt: az adatokat a
   useDashboardData hook adja, a megjelenítést pedig a
   dashboard mappa komponensei. Korábban mindez egyetlen,
   1500 soros fájlban volt.
   ========================================================= */

import { useState } from "react";

import Layout from "../../components/Layout";

import useDashboardData from "../../customHooks/useDashboardData";

import DashboardHeader from "./dashboard/DashboardHeader";
import DashboardStats from "./dashboard/DashboardStats";
import RevenuePanel from "./dashboard/RevenuePanel";
import TablesPanel from "./dashboard/TablesPanel";
import StockPanel from "./dashboard/StockPanel";
import ActiveOrdersPanel from "./dashboard/ActiveOrdersPanel";
import OrderStatusPanel from "./dashboard/OrderStatusPanel";
import PopularProductsPanel from "./dashboard/PopularProductsPanel";
import FinancePanel from "./dashboard/FinancePanel";
import PendingExpensesPanel from "./dashboard/PendingExpensesPanel";
import AdminSection from "./dashboard/AdminSection";
import DashboardFooter from "./dashboard/DashboardFooter";

import { ROLES } from "../../config/permissions";

import "./Admin.scss";

const Admin = () => {
  const data = useDashboardData();

  const [chartMode, setChartMode] = useState("revenue");

  return (
    <Layout>
      <section className="admin">
        <DashboardHeader
          firstName={data.firstName}
          dateLabel={data.dateLabel}
          currentUserRole={data.currentUserRole}
        />

        <DashboardStats
          todayRevenue={data.todayRevenue}
          todayOrders={data.todayOrders}
          averageOrder={data.averageOrder}
          products={data.products}
          criticalStockCount={data.criticalStockCount}
          outOfStockCount={data.outOfStockCount}
          currentUserRole={data.currentUserRole}
          users={data.users}
          onlineUsers={data.onlineUsers}
          selectedCurrentMoney={data.selectedCurrentMoney}
          isSelectedPeriodClosed={data.isSelectedPeriodClosed}
        />

        <section className="admin__mainGrid">
          <RevenuePanel
            last7Days={data.last7Days}
            maxDailyRevenue={data.maxDailyRevenue}
            maxDailyOrders={data.maxDailyOrders}
            chartMode={chartMode}
            onChartModeChange={setChartMode}
          />

          <TablesPanel tables={data.tables} tableStats={data.tableStats} />

          <StockPanel
            stockAlerts={data.stockAlerts}
            currentUserRole={data.currentUserRole}
          />

          <ActiveOrdersPanel activeOrders={data.activeOrders} />

          <OrderStatusPanel
            statusStats={data.statusStats}
            maxStatusCount={data.maxStatusCount}
            orderCount={data.orders.length}
          />

          <PopularProductsPanel
            popularProducts={data.popularProducts}
            maxPopularProduct={data.maxPopularProduct}
          />

          <FinancePanel
            selectedPeriod={data.selectedPeriod}
            selectedStartingBalance={data.selectedStartingBalance}
            selectedMonthRevenue={data.selectedMonthRevenue}
            selectedMonthPurchases={data.selectedMonthPurchases}
            selectedMonthPaidExpenses={data.selectedMonthPaidExpenses}
            selectedCurrentMoney={data.selectedCurrentMoney}
          />

          <PendingExpensesPanel pendingExpenseList={data.pendingExpenseList} />
        </section>

        {data.currentUserRole === ROLES.ADMIN && (
          <AdminSection
            users={data.users}
            onlineUsers={data.onlineUsers}
            userRoleStats={data.userRoleStats}
            recentLogins={data.recentLogins}
            products={data.products}
            orders={data.orders}
            financePeriods={data.financePeriods}
            expenses={data.expenses}
            adminAlerts={data.adminAlerts}
          />
        )}

        <DashboardFooter
          selectedMonthlyResult={data.selectedMonthlyResult}
          selectedMonthPendingExpenses={data.selectedMonthPendingExpenses}
        />
      </section>
    </Layout>
  );
};

export default Admin;
