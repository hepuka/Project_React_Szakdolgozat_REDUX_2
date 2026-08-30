import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import Layout from "../../components/Layout";

import useFetchCollection from "../../customHooks/useFetchCollection";
import useFetchDocument from "../../customHooks/useFetchDocument";

import { selectUserName, selectUserRole } from "../../Redux/slice/authSlice";

import { collection, onSnapshot } from "firebase/firestore";

import { db } from "../../firebase/config";

import "./Admin.scss";

// =========================================================
// ALAPÉRTELMEZETT KEZDŐTŐKE
// =========================================================

const INITIAL_CAPITAL = 1000000;

// =========================================================
// PÉNZÜGYI INDULÁSI IDŐSZAK
// =========================================================

const FINANCE_START_PERIOD = "2026-08";

// =========================================================
// SEGÉDFÜGGVÉNYEK
// =========================================================

const getPeriodId = (date = new Date()) => {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

const getPreviousPeriod = (period) => {
  const [year, month] = period.split("-");

  const date = new Date(Number(year), Number(month) - 2, 1);

  return getPeriodId(date);
};

const formatPeriod = (period) => {
  if (!period) {
    return "";
  }

  const [year, month] = period.split("-");

  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(
    "hu-HU",
    {
      year: "numeric",
      month: "long",
    },
  );
};

const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString("hu-HU");
};

const getDocumentDate = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value?.toDate === "function") {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const isToday = (value) => {
  const date = getDocumentDate(value);

  if (!date) {
    return false;
  }

  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

const isDateInPeriod = (value, period) => {
  const date = getDocumentDate(value);

  if (!date || !period) {
    return false;
  }

  return getPeriodId(date) === period;
};

const formatTime = (value) => {
  const date = getDocumentDate(value);

  if (!date) {
    return "—";
  }

  return date.toLocaleTimeString("hu-HU", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// =========================================================
// ADMIN DASHBOARD
// =========================================================

const Admin = () => {
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

  const [selectedPeriod, setSelectedPeriod] = useState(currentPeriod);

  const [chartMode, setChartMode] = useState("revenue");

  const [tables, setTables] = useState(
    Array.from({ length: 10 }, (_, index) => ({
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
  // IDŐSZAKOK
  // =======================================================

  const availablePeriods = useMemo(() => {
    const periods = new Set();

    financePeriods.forEach((item) => {
      if (item?.period) {
        periods.add(item.period);
      }
    });

    expenses.forEach((item) => {
      if (item?.period) {
        periods.add(item.period);
      }
    });

    orders.forEach((item) => {
      const date = getDocumentDate(item?.createdAt);

      if (date) {
        const period = getPeriodId(date);

        if (period >= FINANCE_START_PERIOD) {
          periods.add(period);
        }
      }
    });

    stockPurchases.forEach((item) => {
      const date = getDocumentDate(item?.createdAt);

      if (date) {
        const period = getPeriodId(date);

        if (period >= FINANCE_START_PERIOD) {
          periods.add(period);
        }
      }
    });

    periods.add(FINANCE_START_PERIOD);

    if (currentPeriod >= FINANCE_START_PERIOD) {
      periods.add(currentPeriod);
    }

    return Array.from(periods).sort((a, b) => b.localeCompare(a));
  }, [financePeriods, expenses, orders, stockPurchases, currentPeriod]);

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
  // KIVÁLASZTOTT HÓNAP BEVÉTELE
  // =======================================================

  const selectedMonthRevenue = useMemo(() => {
    return orders.reduce((sum, order) => {
      if (!isDateInPeriod(order?.createdAt, selectedPeriod)) {
        return sum;
      }

      if (order?.orderStatus && order.orderStatus !== "Fizetve") {
        return sum;
      }

      return sum + Number(order?.orderAmount || 0);
    }, 0);
  }, [orders, selectedPeriod]);

  // =======================================================
  // KIVÁLASZTOTT HÓNAP BESZERZÉSE
  // =======================================================

  const selectedMonthPurchases = useMemo(() => {
    return stockPurchases.reduce((sum, purchase) => {
      if (!isDateInPeriod(purchase?.createdAt, selectedPeriod)) {
        return sum;
      }

      return sum + Number(purchase?.total || 0);
    }, 0);
  }, [stockPurchases, selectedPeriod]);

  // =======================================================
  // KIVÁLASZTOTT HÓNAP RENDEZETT KIADÁSA
  // =======================================================

  const selectedMonthPaidExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => {
      if (expense?.period !== selectedPeriod) {
        return sum;
      }

      if (expense?.status !== "paid") {
        return sum;
      }

      return sum + Number(expense?.amount || 0);
    }, 0);
  }, [expenses, selectedPeriod]);

  // =======================================================
  // KIVÁLASZTOTT HÓNAP FÜGGŐ KIADÁSA
  // =======================================================

  const selectedMonthPendingExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => {
      if (expense?.period !== selectedPeriod) {
        return sum;
      }

      if (expense?.status === "paid") {
        return sum;
      }

      return sum + Number(expense?.amount || 0);
    }, 0);
  }, [expenses, selectedPeriod]);

  // =======================================================
  // KIVÁLASZTOTT HÓNAP EREDMÉNYE
  // =======================================================

  const selectedMonthlyResult =
    selectedMonthRevenue - selectedMonthPurchases - selectedMonthPaidExpenses;

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
      Admin: 0,
      Manager: 0,
      Leader: 0,
      Employee: 0,
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
        icon: "🔴",
        title: "Elfogyott termékek",
        value: `${outOfStockCount} db`,
        description: "Azonnali készletfeltöltés szükséges.",
      });
    }

    if (criticalStockCount > 0) {
      alerts.push({
        type: "warning",
        icon: "🟡",
        title: "Kritikus készlet",
        value: `${criticalStockCount} db`,
        description: "Alacsony készletszintű termékek.",
      });
    }

    if (selectedMonthPendingExpenses > 0) {
      alerts.push({
        type: "warning",
        icon: "💳",
        title: "Rendezetlen kiadások",
        value: `${formatCurrency(selectedMonthPendingExpenses)} Ft`,
        description: "Még vannak nem rendezett számlák.",
      });
    }

    if (onlineUsers.length === 0) {
      alerts.push({
        type: "info",
        icon: "⚪",
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
    const unsubscribers = [];

    for (let tableNumber = 1; tableNumber <= 10; tableNumber += 1) {
      const ordersRef = collection(db, `tableorders_${tableNumber}`);

      const unsubscribe = onSnapshot(
        ordersRef,
        (snapshot) => {
          const tableOrders = snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }));

          setTables((currentTables) =>
            currentTables.map((table) =>
              table.number === tableNumber
                ? {
                    ...table,
                    orders: tableOrders,
                  }
                : table,
            ),
          );
        },
        (error) => {
          console.error(`Table ${tableNumber} listener error:`, error);
        },
      );

      unsubscribers.push(unsubscribe);
    }

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
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
  // RENDER
  // =======================================================

  return (
    <Layout>
      <section className="admin">
        {/* =================================================
            HEADER
           ================================================= */}

        <header className="admin__header">
          <div>
            <span className="admin__eyebrow">Coffee Management Dashboard</span>

            <h1>Jó napot, {firstName}</h1>

            <p className="admin__date">{dateLabel}</p>
          </div>

          <div className="admin__headerActions">
            <div className="admin__liveStatus">
              <span className="admin__liveDot" />

              <div>
                <small>{currentUserRole || "Felhasználó"}</small>

                <strong>Rendszer aktív</strong>
              </div>
            </div>

            <div className="admin__headerLogo">
              <img
                src="https://freesvg.org/img/1667812423coffee-shop-logo-concept.png"
                alt="KunPao's Coffee"
              />
            </div>
          </div>
        </header>

        {/* =================================================
            KPI
           ================================================= */}

        <section className="admin__stats">
          <article className="admin__statCard">
            <div className="admin__statTop">
              <div className="admin__statIcon">💰</div>

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
              <div className="admin__statIcon">🧾</div>

              <span className="admin__statCaption">Mai rendelések</span>
            </div>

            <strong className="admin__statValue">{todayOrders.length}</strong>

            <span className="admin__statMeta">
              Átlag: {formatCurrency(averageOrder)} Ft
            </span>
          </article>

          <article className="admin__statCard">
            <div className="admin__statTop">
              <div className="admin__statIcon">☕</div>

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

          {currentUserRole === "Admin" ? (
            <article className="admin__statCard">
              <div className="admin__statTop">
                <div className="admin__statIcon">👥</div>

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
                <div className="admin__statIcon">💵</div>

                <span className="admin__statCaption">Kávézó pénze</span>
              </div>

              <strong className="admin__statValue">
                {formatCurrency(selectedCurrentMoney)} Ft
              </strong>

              <span className="admin__statMeta">
                {isSelectedPeriodClosed
                  ? "🔒 Hónap lezárva"
                  : "🟢 Nyitott hónap"}
              </span>
            </article>
          )}
        </section>

        {/* =================================================
            MAIN GRID
           ================================================= */}

        <section className="admin__mainGrid">
          {/* =================================================
              7 NAPOS GRAFIKON
             ================================================= */}

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
                  onClick={() => setChartMode("revenue")}
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
                  onClick={() => setChartMode("orders")}
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

          {/* =================================================
              ASZTALOK
             ================================================= */}

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

          {/* =================================================
              KÉSZLET
             ================================================= */}

          <article className="admin__panel">
            <div className="admin__panelHeader">
              <div>
                <span className="admin__panelEyebrow">Készlet</span>

                <h2>Figyelmeztetések</h2>
              </div>

              {currentUserRole !== "Admin" && (
                <Link to="/products" className="admin__panelLink">
                  Termékek
                </Link>
              )}
            </div>

            {stockAlerts.length === 0 ? (
              <div className="admin__emptySmall">
                <span>✓</span>

                <p>Minden termék megfelelő készletszinten van.</p>
              </div>
            ) : (
              <div className="admin__stockList">
                {stockAlerts.slice(0, 5).map((product) => {
                  const stock = Number(product?.stock || 0);

                  const minStock = Number(product?.minStock || 0);

                  const empty = stock <= 0;

                  return (
                    <Link
                      key={product.id}
                      to="/products"
                      className="admin__stockRow"
                    >
                      <span
                        className={
                          empty
                            ? "admin__stockDot admin__stockDot--empty"
                            : "admin__stockDot admin__stockDot--low"
                        }
                      />

                      <div>
                        <strong>{product.name}</strong>

                        <small>
                          {empty ? "Elfogyott" : `Minimum: ${minStock} db`}
                        </small>
                      </div>

                      <strong
                        className={
                          empty
                            ? "admin__stockValue admin__stockValue--empty"
                            : "admin__stockValue admin__stockValue--low"
                        }
                      >
                        {stock} db
                      </strong>
                    </Link>
                  );
                })}
              </div>
            )}
          </article>

          {/* =================================================
              AKTÍV RENDELÉSEK
             ================================================= */}

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
                <span>✓</span>

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

          {/* =================================================
              RENDELÉSI STÁTUSZOK
             ================================================= */}

          <article className="admin__panel">
            <div className="admin__panelHeader">
              <div>
                <span className="admin__panelEyebrow">Rendelések</span>

                <h2>Rendelések állapota</h2>
              </div>

              <span className="admin__panelBadge">
                {orders.length} összesen
              </span>
            </div>

            {statusStats.length === 0 ? (
              <div className="admin__emptySmall">Még nincs rendelési adat.</div>
            ) : (
              <div className="admin__statusList">
                {statusStats.slice(0, 5).map((item) => (
                  <div key={item.name} className="admin__statusRow">
                    <div className="admin__statusTop">
                      <span>{item.name}</span>

                      <strong>{item.count}</strong>
                    </div>

                    <div className="admin__statusTrack">
                      <div
                        className="admin__statusBar"
                        style={{
                          width: `${(item.count / maxStatusCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

          {/* =================================================
              TOP TERMÉKEK
             ================================================= */}

          <article className="admin__panel">
            <div className="admin__panelHeader">
              <div>
                <span className="admin__panelEyebrow">Mai értékesítés</span>

                <h2>Legnépszerűbb termékek</h2>
              </div>

              <span className="admin__panelBadge">Eladott mennyiség</span>
            </div>

            {popularProducts.length === 0 ? (
              <div className="admin__emptySmall">
                <span>☕</span>

                <p>Ma még nincs elegendő értékesítési adat.</p>
              </div>
            ) : (
              <div className="admin__popularList">
                {popularProducts.map((item, index) => (
                  <div key={item.name} className="admin__popularRow">
                    <div className="admin__popularRank">{index + 1}</div>

                    <div className="admin__popularIcon">☕</div>

                    <div className="admin__popularInfo">
                      <div className="admin__popularTitle">
                        <strong>{item.name}</strong>

                        <span>{item.amount} db</span>
                      </div>

                      <div className="admin__popularTrack">
                        <div
                          className="admin__popularBar"
                          style={{
                            width: `${
                              (item.amount / maxPopularProduct) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

          {/* =================================================
              PÉNZÜGYEK
             ================================================= */}

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

          {/* =================================================
              RENDEZETLEN SZÁMLÁK
             ================================================= */}

          <article className="admin__panel admin__panel--expenses">
            <div className="admin__panelHeader">
              <div>
                <span className="admin__panelEyebrow">Figyelmeztetés</span>

                <h2>Rendezetlen számlák</h2>
              </div>

              <Link to="/expenses" className="admin__panelLink">
                Kezelés
              </Link>
            </div>

            {pendingExpenseList.length === 0 ? (
              <div className="admin__emptySmall">
                <span>✓</span>

                <p>Nincs rendezetlen számla ebben a hónapban.</p>
              </div>
            ) : (
              <div className="admin__expenseList">
                {pendingExpenseList.map((expense) => (
                  <Link
                    key={expense.id}
                    to="/expenses"
                    className="admin__expenseRow"
                  >
                    <div className="admin__expenseWarning">!</div>

                    <div className="admin__expenseInfo">
                      <strong>{expense.description}</strong>

                      <span>
                        {expense.category}

                        {expense.dueDate && ` • Határidő: ${expense.dueDate}`}
                      </span>
                    </div>

                    <strong className="admin__expenseAmount">
                      − {formatCurrency(expense.amount)} Ft
                    </strong>
                  </Link>
                ))}
              </div>
            )}
          </article>
        </section>

        {/* ===================================================
            ADMIN / RENDSZERFELÜGYELET
           =================================================== */}

        {currentUserRole === "Admin" && (
          <section className="admin__adminSection">
            <div className="admin__adminSectionHeader">
              <div>
                <span className="admin__eyebrow">Adminisztráció</span>

                <h2>Admin / rendszerfelügyelet</h2>

                <p>
                  Felhasználók, jogosultságok és a rendszer állapotának
                  áttekintése.
                </p>
              </div>

              <Link to="/users" className="admin__adminUsersButton">
                Felhasználók kezelése
              </Link>
            </div>

            <div className="admin__adminGrid">
              {/* =============================================
                  FELHASZNÁLÓI ÁLLAPOT
                 ============================================= */}

              <article className="admin__adminPanel">
                <div className="admin__panelHeader">
                  <div>
                    <span className="admin__panelEyebrow">Felhasználók</span>

                    <h2>Felhasználói állapot</h2>
                  </div>

                  <span className="admin__panelBadge">
                    {users.length} felhasználó
                  </span>
                </div>

                <div className="admin__userStatusSummary">
                  <div className="admin__userStatusMain">
                    <span className="admin__userOnlineDot" />

                    <div>
                      <strong>{onlineUsers.length}</strong>

                      <span>online</span>
                    </div>
                  </div>

                  <div className="admin__userStatusOffline">
                    <strong>
                      {Math.max(users.length - onlineUsers.length, 0)}
                    </strong>

                    <span>offline</span>
                  </div>
                </div>

                <div className="admin__userRoleMiniList">
                  <div>
                    <span>Admin</span>

                    <strong>{userRoleStats.Admin}</strong>
                  </div>

                  <div>
                    <span>Manager</span>

                    <strong>{userRoleStats.Manager}</strong>
                  </div>

                  <div>
                    <span>Leader</span>

                    <strong>{userRoleStats.Leader}</strong>
                  </div>

                  <div>
                    <span>Employee</span>

                    <strong>{userRoleStats.Employee}</strong>
                  </div>
                </div>
              </article>

              {/* =============================================
                  JOGOSULTSÁGOK
                 ============================================= */}

              <article className="admin__adminPanel">
                <div className="admin__panelHeader">
                  <div>
                    <span className="admin__panelEyebrow">Jogosultság</span>

                    <h2>Szerepkörök</h2>
                  </div>
                </div>

                <div className="admin__permissionList">
                  <div className="admin__permissionRow">
                    <div className="admin__permissionIcon">A</div>

                    <span>Admin</span>

                    <strong>{userRoleStats.Admin}</strong>
                  </div>

                  <div className="admin__permissionRow">
                    <div className="admin__permissionIcon">M</div>

                    <span>Manager</span>

                    <strong>{userRoleStats.Manager}</strong>
                  </div>

                  <div className="admin__permissionRow">
                    <div className="admin__permissionIcon">L</div>

                    <span>Leader</span>

                    <strong>{userRoleStats.Leader}</strong>
                  </div>

                  <div className="admin__permissionRow">
                    <div className="admin__permissionIcon">E</div>

                    <span>Employee</span>

                    <strong>{userRoleStats.Employee}</strong>
                  </div>
                </div>
              </article>

              {/* =============================================
                  LEGUTÓBBI BEJELENTKEZÉSEK
                 ============================================= */}

              <article className="admin__adminPanel">
                <div className="admin__panelHeader">
                  <div>
                    <span className="admin__panelEyebrow">Biztonság</span>

                    <h2>Legutóbbi bejelentkezések</h2>
                  </div>
                </div>

                {recentLogins.length === 0 ? (
                  <div className="admin__emptySmall">
                    <span>👥</span>

                    <p>Még nincs bejelentkezési adat.</p>
                  </div>
                ) : (
                  <div className="admin__recentLoginList">
                    {recentLogins.map((user) => {
                      const loginDate = getDocumentDate(user.last_login);

                      return (
                        <div key={user.id} className="admin__recentLoginRow">
                          <div className="admin__recentLoginAvatar">
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>

                          <div className="admin__recentLoginInfo">
                            <strong>
                              {user.name || "Ismeretlen felhasználó"}
                            </strong>

                            <span>{user.role || "Ismeretlen szerepkör"}</span>
                          </div>

                          <div className="admin__recentLoginTime">
                            <strong>
                              {loginDate
                                ? loginDate.toLocaleDateString("hu-HU", {
                                    month: "2-digit",
                                    day: "2-digit",
                                  })
                                : "—"}
                            </strong>

                            <span>
                              {loginDate
                                ? loginDate.toLocaleTimeString("hu-HU", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "—"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>

              {/* =============================================
                  RENDSZERÁLLAPOT
                 ============================================= */}

              <article className="admin__adminPanel">
                <div className="admin__panelHeader">
                  <div>
                    <span className="admin__panelEyebrow">Rendszer</span>

                    <h2>Rendszerállapot</h2>
                  </div>
                </div>

                <div className="admin__systemList">
                  <div className="admin__systemRow">
                    <span className="admin__systemStatusDot" />

                    <span>Felhasználói adatok</span>

                    <strong>{users.length} rekord</strong>
                  </div>

                  <div className="admin__systemRow">
                    <span className="admin__systemStatusDot" />

                    <span>Termékadatok</span>

                    <strong>{products.length} rekord</strong>
                  </div>

                  <div className="admin__systemRow">
                    <span className="admin__systemStatusDot" />

                    <span>Rendelések</span>

                    <strong>{orders.length} rekord</strong>
                  </div>

                  <div className="admin__systemRow">
                    <span className="admin__systemStatusDot" />

                    <span>Pénzügyi időszakok</span>

                    <strong>{financePeriods.length} rekord</strong>
                  </div>

                  <div className="admin__systemRow">
                    <span className="admin__systemStatusDot" />

                    <span>Kiadások</span>

                    <strong>{expenses.length} rekord</strong>
                  </div>
                </div>
              </article>

              {/* =============================================
                  ADMIN FIGYELMEZTETÉSEK
                 ============================================= */}

              <article className="admin__adminPanel admin__adminPanel--alerts">
                <div className="admin__panelHeader">
                  <div>
                    <span className="admin__panelEyebrow">Figyelmeztetés</span>

                    <h2>Admin figyelmeztetések</h2>
                  </div>

                  <span className="admin__panelBadge">
                    {adminAlerts.length} elem
                  </span>
                </div>

                {adminAlerts.length === 0 ? (
                  <div className="admin__adminNoAlerts">
                    <span>✓</span>

                    <div>
                      <strong>Nincs kritikus figyelmeztetés</strong>

                      <p>
                        A rendszer jelenlegi állapotában nincs azonnali
                        adminisztratív teendő.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="admin__adminAlertList">
                    {adminAlerts.map((alert, index) => (
                      <div
                        key={`${alert.title}-${index}`}
                        className={`admin__adminAlert admin__adminAlert--${alert.type}`}
                      >
                        <div className="admin__adminAlertIcon">
                          {alert.icon}
                        </div>

                        <div className="admin__adminAlertInfo">
                          <strong>{alert.title}</strong>

                          <span>{alert.description}</span>
                        </div>

                        <strong className="admin__adminAlertValue">
                          {alert.value}
                        </strong>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </div>
          </section>
        )}

        {/* ===================================================
            FOOTER SUMMARY
           =================================================== */}

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
              ● Minden rendszer aktív
            </strong>
          </div>
        </footer>
      </section>
    </Layout>
  );
};

export default Admin;
