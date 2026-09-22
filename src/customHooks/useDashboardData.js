/* =========================================================
   IRÁNYÍTÓPULT ADATAI
   =========================================================

   Az Admin oldal teljes adatrétege: a Firestore-lekérdezések,
   a származtatott mutatók és az asztalok valós idejű
   figyelése. A megjelenítés az Admin.jsx-ben és a
   pages/admin/dashboard komponenseiben van, így az
   adatlogika külön tesztelhető és külön olvasható.
   ========================================================= */

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { collection, onSnapshot } from "firebase/firestore";

import { db } from "../firebase/config";

import { TABLE_COUNT, TABLE_ORDERS } from "../config/tables";

import useFetchCollection from "./useFetchCollection";
import useFetchDocument from "./useFetchDocument";

import { selectUserName, selectUserRole } from "../Redux/slice/authSlice";

import { INITIAL_CAPITAL, FINANCE_START_PERIOD } from "../config/finance";

import { ROLES } from "../config/permissions";

import {
  calculatePeriodFinancials,
  formatCurrency,
  getDocumentDate,
  getPeriodId,
  getPreviousPeriod,
  isToday,
} from "../services/financeCalculations";

const useDashboardData = () => {
  const currentUser = useSelector(selectUserName);

  const currentUserRole = useSelector(selectUserRole);

  // =======================================================
  // FIRESTORE
  // =======================================================

  const users = useFetchCollection("users");

  const orders = useFetchCollection("kunpaosorders");

  const products = useFetchCollection("kunpaosproducts");

  const stockPurchases = useFetchCollection("stockPurchases");

  const expenses = useFetchCollection("businessExpenses");

  const financePeriods = useFetchCollection("financePeriods");

  const financeSettings = useFetchDocument("finance", "settings");

  // =======================================================
  // ÁLLAPOT
  // =======================================================

  const today = new Date();

  const currentPeriod = getPeriodId(today);

  const [selectedPeriod] = useState(currentPeriod);

  const [tables, setTables] = useState(
    Array.from({ length: TABLE_COUNT }, (_, index) => ({
      number: index + 1,
      orders: [],
    })),
  );

  // =======================================================
  // FELHASZNÁLÓNÉV
  // =======================================================

  const firstName = currentUser
    ? currentUser.trim().split(/\s+/)[0]
    : "Felhasználó";

  // =======================================================
  // KEZDŐTŐKE
  // =======================================================

  const initialCapital = Number(
    financeSettings?.initialCapital ?? INITIAL_CAPITAL,
  );

  // =======================================================
  // DÁTUM
  // =======================================================

  const dateLabel = today.toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // =======================================================
  // KIVÁLASZTOTT PÉNZÜGYI IDŐSZAK
  // =======================================================

  const selectedFinancePeriod = financePeriods.find(
    (item) => item?.period === selectedPeriod,
  );

  const isSelectedPeriodClosed = selectedFinancePeriod?.isClosed === true;

  // =======================================================
  // HAVI KEZDŐ PÉNZ
  // =======================================================

  const selectedStartingBalance = useMemo(() => {
    if (selectedPeriod === FINANCE_START_PERIOD) {
      return initialCapital;
    }

    const previousPeriod = getPreviousPeriod(selectedPeriod);

    const previousFinancePeriod = financePeriods.find(
      (item) => item?.period === previousPeriod,
    );

    if (previousFinancePeriod?.isClosed === true) {
      return Number(previousFinancePeriod?.closingBalance ?? 0);
    }

    return initialCapital;
  }, [selectedPeriod, financePeriods, initialCapital]);

  // =======================================================
  // KIVÁLASZTOTT HÓNAP PÉNZÜGYEI
  //
  // Bevétel, beszerzés, rendezett és függő kiadás,
  // valamint a havi eredmény egyetlen forrásból.
  // Ugyanez a függvény számol a Business és az
  // Expenses oldalon is.
  // =======================================================

  const {
    revenue: selectedMonthRevenue,
    purchases: selectedMonthPurchases,
    paidExpenses: selectedMonthPaidExpenses,
    pendingExpenses: selectedMonthPendingExpenses,
    monthlyResult: selectedMonthlyResult,
  } = useMemo(
    () =>
      calculatePeriodFinancials({
        orders,
        stockPurchases,
        expenses,
        period: selectedPeriod,
        startingBalance: selectedStartingBalance,
      }),
    [orders, stockPurchases, expenses, selectedPeriod, selectedStartingBalance],
  );

  // =======================================================
  // KIVÁLASZTOTT HÓNAP PÉNZE
  // =======================================================

  const selectedCurrentMoney = isSelectedPeriodClosed
    ? Number(
        selectedFinancePeriod?.closingBalance ??
          selectedStartingBalance + selectedMonthlyResult,
      )
    : selectedStartingBalance + selectedMonthlyResult;

  // =======================================================
  // MAI RENDELÉSEK
  // =======================================================

  const todayOrders = useMemo(() => {
    return orders.filter((order) =>
      isToday(order?.createdAt ?? order?.orderDate),
    );
  }, [orders]);

  // =======================================================
  // MAI BEVÉTEL
  // =======================================================

  const todayRevenue = useMemo(() => {
    return todayOrders.reduce(
      (sum, order) => sum + Number(order?.orderAmount || 0),
      0,
    );
  }, [todayOrders]);

  // =======================================================
  // ÁTLAGOS RENDELÉSI ÉRTÉK
  // =======================================================

  const averageOrder =
    todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0;

  // =======================================================
  // UTOLSÓ 7 NAP
  // =======================================================

  const last7Days = useMemo(() => {
    const days = [];

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date();

      date.setHours(0, 0, 0, 0);

      date.setDate(date.getDate() - i);

      const dayOrders = orders.filter((order) => {
        const orderDate = getDocumentDate(order?.createdAt ?? order?.orderDate);

        if (!orderDate) {
          return false;
        }

        return (
          orderDate.getFullYear() === date.getFullYear() &&
          orderDate.getMonth() === date.getMonth() &&
          orderDate.getDate() === date.getDate()
        );
      });

      const amount = dayOrders.reduce(
        (sum, order) => sum + Number(order?.orderAmount || 0),
        0,
      );

      days.push({
        date,
        label: date.toLocaleDateString("hu-HU", {
          weekday: "short",
        }),
        shortDate: `${date.getMonth() + 1}.${date.getDate()}.`,
        amount,
        orders: dayOrders.length,
      });
    }

    return days;
  }, [orders]);

  const maxDailyRevenue = Math.max(...last7Days.map((day) => day.amount), 1);

  const maxDailyOrders = Math.max(...last7Days.map((day) => day.orders), 1);

  // =======================================================
  // RENDELÉSI STÁTUSZOK
  // =======================================================

  const statusStats = useMemo(() => {
    const stats = {};

    orders.forEach((order) => {
      const status = order?.orderStatus || "Ismeretlen";

      if (!stats[status]) {
        stats[status] = {
          name: status,
          count: 0,
        };
      }

      stats[status].count += 1;
    });

    return Object.values(stats).sort((a, b) => b.count - a.count);
  }, [orders]);

  const maxStatusCount = Math.max(...statusStats.map((item) => item.count), 1);

  // =======================================================
  // TOP TERMÉKEK
  // =======================================================

  const popularProducts = useMemo(() => {
    const productMap = {};

    todayOrders.forEach((order) => {
      const items = Array.isArray(order?.cartItems) ? order.cartItems : [];

      items.forEach((item) => {
        const name = item?.name?.trim();

        if (!name) {
          return;
        }

        const amount = Number(item?.amount || 0);

        productMap[name] = (productMap[name] || 0) + amount;
      });
    });

    return Object.entries(productMap)
      .map(([name, amount]) => ({
        name,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [todayOrders]);

  const maxPopularProduct = Math.max(
    ...popularProducts.map((item) => item.amount),
    1,
  );

  // =======================================================
  // KÉSZLET
  // =======================================================

  const stockAlerts = useMemo(() => {
    return products
      .filter((product) => {
        const stock = Number(product?.stock || 0);

        const minStock = Number(product?.minStock || 0);

        return stock <= minStock;
      })
      .sort((a, b) => {
        return Number(a?.stock || 0) - Number(b?.stock || 0);
      });
  }, [products]);

  const criticalStockCount = stockAlerts.filter(
    (product) => Number(product?.stock || 0) > 0,
  ).length;

  const outOfStockCount = stockAlerts.filter(
    (product) => Number(product?.stock || 0) <= 0,
  ).length;

  // =======================================================
  // FELHASZNÁLÓI ADATOK
  // =======================================================

  const onlineUsers = useMemo(() => {
    return users.filter((user) => user?.online === true);
  }, [users]);

  const userRoleStats = useMemo(() => {
    const stats = {
      [ROLES.ADMIN]: 0,
      [ROLES.MANAGER]: 0,
      [ROLES.LEADER]: 0,
      [ROLES.EMPLOYEE]: 0,
    };

    users.forEach((user) => {
      if (stats[user?.role] !== undefined) {
        stats[user.role] += 1;
      }
    });

    return stats;
  }, [users]);

  // =======================================================
  // LEGUTÓBBI BEJELENTKEZÉSEK
  // =======================================================

  const recentLogins = useMemo(() => {
    return users
      .filter((user) => user?.last_login)
      .sort((a, b) => {
        const dateA = getDocumentDate(a.last_login);

        const dateB = getDocumentDate(b.last_login);

        return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
      })
      .slice(0, 5);
  }, [users]);

  // =======================================================
  // ADMIN FIGYELMEZTETÉSEK
  // =======================================================

  const adminAlerts = useMemo(() => {
    const alerts = [];

    if (outOfStockCount > 0) {
      alerts.push({
        type: "danger",
        icon: "alert",
        title: "Elfogyott termékek",
        value: `${outOfStockCount} db`,
        description: "Azonnali készletfeltöltés szükséges.",
      });
    }

    if (criticalStockCount > 0) {
      alerts.push({
        type: "warning",
        icon: "alert",
        title: "Kritikus készlet",
        value: `${criticalStockCount} db`,
        description: "Alacsony készletszintű termékek.",
      });
    }

    if (selectedMonthPendingExpenses > 0) {
      alerts.push({
        type: "warning",
        icon: "wallet",
        title: "Rendezetlen kiadások",
        value: `${formatCurrency(selectedMonthPendingExpenses)} Ft`,
        description: "Még vannak nem rendezett számlák.",
      });
    }

    if (onlineUsers.length === 0) {
      alerts.push({
        type: "info",
        icon: "info",
        title: "Nincs online felhasználó",
        value: "0",
        description: "Jelenleg senki nincs bejelentkezve.",
      });
    }

    return alerts;
  }, [
    outOfStockCount,
    criticalStockCount,
    selectedMonthPendingExpenses,
    onlineUsers.length,
  ]);

  // =======================================================
  // ASZTALOK REALTIME
  // =======================================================

  useEffect(() => {
    /*
     * Egyetlen figyelő a közös tableOrders kollekción.
     * Korábban tíz külön figyelő futott, asztalonként egy.
     */
    const unsubscribe = onSnapshot(
      collection(db, TABLE_ORDERS),
      (snapshot) => {
        const grouped = Array.from({ length: TABLE_COUNT }, (_, index) => ({
          number: index + 1,
          orders: [],
        }));

        snapshot.docs.forEach((item) => {
          const order = {
            id: item.id,
            ...item.data(),
          };

          const index = Number(order?.tableNumber) - 1;

          if (index >= 0 && index < grouped.length) {
            grouped[index].orders.push(order);
          }
        });

        setTables(grouped);
      },
      (error) => {
        console.error("Table orders listener error:", error);
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // =======================================================
  // ASZTAL STATISZTIKA
  // =======================================================

  const tableStats = useMemo(() => {
    const free = tables.filter((table) => table.orders.length === 0);

    const busy = tables.filter((table) => table.orders.length > 0);

    return {
      free,
      busy,
    };
  }, [tables]);

  // =======================================================
  // AKTÍV RENDELÉSEK
  // =======================================================

  const activeOrders = useMemo(() => {
    return tables
      .filter((table) => table.orders.length > 0)
      .map((table) => {
        const total = table.orders.reduce(
          (sum, item) => sum + Number(item?.sum || 0),
          0,
        );

        const itemCount = table.orders.reduce(
          (sum, item) => sum + Number(item?.amount || 0),
          0,
        );

        const latestOrder = table.orders.slice().sort((a, b) => {
          const dateA = getDocumentDate(a?.createdAt);

          const dateB = getDocumentDate(b?.createdAt);

          return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
        })[0];

        return {
          tableNumber: table.number,
          total,
          itemCount,
          latestOrder,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [tables]);

  // =======================================================
  // RENDEZETLEN SZÁMLÁK
  // =======================================================

  const pendingExpenseList = useMemo(() => {
    return expenses
      .filter(
        (expense) =>
          expense?.period === currentPeriod && expense?.status !== "paid",
      )
      .sort((a, b) => {
        const dateA = a?.dueDate || "9999-12-31";

        const dateB = b?.dueDate || "9999-12-31";

        return dateA.localeCompare(dateB);
      })
      .slice(0, 5);
  }, [expenses, currentPeriod]);

  // =======================================================
  // AZ OLDAL ÁLTAL HASZNÁLT ADATOK
  // =======================================================

  return {
    // felhasználó
    firstName,
    currentUserRole,

    // gyűjtemények
    users,
    orders,
    products,
    expenses,
    financePeriods,

    // dátum és időszak
    dateLabel,
    selectedPeriod,
    isSelectedPeriodClosed,

    // napi mutatók
    todayOrders,
    todayRevenue,
    averageOrder,

    // grafikonok
    last7Days,
    maxDailyRevenue,
    maxDailyOrders,
    statusStats,
    maxStatusCount,
    popularProducts,
    maxPopularProduct,

    // készlet
    stockAlerts,
    criticalStockCount,
    outOfStockCount,

    // felhasználói állapot
    onlineUsers,
    userRoleStats,
    recentLogins,
    adminAlerts,

    // asztalok
    tables,
    tableStats,
    activeOrders,

    // pénzügyek
    selectedStartingBalance,
    selectedMonthRevenue,
    selectedMonthPurchases,
    selectedMonthPaidExpenses,
    selectedMonthPendingExpenses,
    selectedMonthlyResult,
    selectedCurrentMoney,
    pendingExpenseList,
  };
};

export default useDashboardData;
