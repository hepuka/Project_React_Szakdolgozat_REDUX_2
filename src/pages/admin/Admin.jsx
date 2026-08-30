import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import Layout from "../../components/Layout";

import useFetchCollection from "../../customHooks/useFetchCollection";
import useFetchDocument from "../../customHooks/useFetchDocument";

import { selectUserName } from "../../Redux/slice/authSlice";

import { collection, onSnapshot } from "firebase/firestore";

import { db } from "../../firebase/config";

import "./Admin.scss";

// =========================================================
// SEGÉDFÜGGVÉNYEK
// =========================================================

const INITIAL_CAPITAL = 1000000;

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

const getStatusKey = (status) => {
  return String(status || "Ismeretlen")
    .trim()
    .toLowerCase();
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

  const orders = useFetchCollection("kunpaosorders");

  const products = useFetchCollection("kunpaosproducts");

  const stockPurchases = useFetchCollection("stockPurchases");

  const expenses = useFetchCollection("businessExpenses");

  const financePeriods = useFetchCollection("financePeriods");

  const financeSettings = useFetchDocument("finance", "settings");

  // =========================================================
  // ÁLLAPOTOK
  // =========================================================

  const [tables, setTables] = useState(
    Array.from({ length: 10 }, (_, index) => ({
      number: index + 1,
      orders: [],
    })),
  );

  const [chartMode, setChartMode] = useState("revenue");

  // =========================================================
  // DÁTUM
  // =========================================================

  const today = new Date();

  const currentPeriod = getPeriodId(today);

  const firstName = currentUser
    ? currentUser.trim().split(/\s+/)[0]
    : "Felhasználó";

  const dateLabel = today.toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // =========================================================
  // FINANCE SETTINGS
  // =========================================================

  const initialCapital = Number(
    financeSettings?.initialCapital ?? INITIAL_CAPITAL,
  );

  // =========================================================
  // MAI RENDELÉSEK
  // =========================================================

  const todayOrders = useMemo(() => {
    return orders.filter((order) =>
      isToday(order?.createdAt ?? order?.orderDate),
    );
  }, [orders]);

  // =========================================================
  // MAI BEVÉTEL
  // =========================================================

  const todayRevenue = useMemo(() => {
    return todayOrders.reduce((sum, order) => {
      return sum + Number(order?.orderAmount || 0);
    }, 0);
  }, [todayOrders]);

  // =========================================================
  // TELJES BEVÉTEL
  // =========================================================

  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, order) => {
      /*
       * A fizetett rendelések számítanak
       * valódi bevételnek.
       *
       * Régebbi rekordoknál, ahol nincs
       * orderStatus, továbbra is számoljuk.
       */

      if (order?.orderStatus && order.orderStatus !== "Fizetve") {
        return sum;
      }

      return sum + Number(order?.orderAmount || 0);
    }, 0);
  }, [orders]);

  // =========================================================
  // ÁTLAGOS RENDELÉSI ÉRTÉK
  // =========================================================

  const averageOrder =
    todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0;

  // =========================================================
  // UTOLSÓ 7 NAP
  // =========================================================

  const last7Days = useMemo(() => {
    const days = [];

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(today);

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

  // =========================================================
  // RENDELÉSI STÁTUSZOK
  // =========================================================

  const statusStats = useMemo(() => {
    const stats = {};

    orders.forEach((order) => {
      const rawStatus = order?.orderStatus || "Ismeretlen";

      const key = getStatusKey(rawStatus);

      if (!stats[key]) {
        stats[key] = {
          name: rawStatus,
          count: 0,
        };
      }

      stats[key].count += 1;
    });

    return Object.values(stats).sort((a, b) => b.count - a.count);
  }, [orders]);

  const maxStatusCount = Math.max(...statusStats.map((item) => item.count), 1);

  // =========================================================
  // MAI TOP TERMÉKEK
  // =========================================================

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

  // =========================================================
  // KÉSZLET FIGYELMEZTETÉSEK
  // =========================================================

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

  // =========================================================
  // HAVI PÉNZÜGYEK
  // =========================================================

  const currentFinancePeriod = financePeriods.find(
    (item) => item?.period === currentPeriod,
  );

  const startingBalance = useMemo(() => {
    /*
     * A kávézó induló hónapja:
     * 2026.08 = 1 000 000 Ft.
     */

    if (currentPeriod === "2026-08") {
      return initialCapital;
    }

    /*
     * Későbbi hónapnál az előző
     * lezárt hónap záró pénzét
     * használjuk.
     */

    const previousPeriod = getPreviousPeriod(currentPeriod);

    const previous = financePeriods.find(
      (item) => item?.period === previousPeriod,
    );

    if (previous?.isClosed) {
      return Number(previous?.closingBalance || 0);
    }

    return initialCapital;
  }, [currentPeriod, financePeriods, initialCapital]);

  const currentMonthRevenue = useMemo(() => {
    return orders.reduce((sum, order) => {
      if (
        !isDateInPeriod(order?.createdAt ?? order?.orderDate, currentPeriod)
      ) {
        return sum;
      }

      if (order?.orderStatus && order.orderStatus !== "Fizetve") {
        return sum;
      }

      return sum + Number(order?.orderAmount || 0);
    }, 0);
  }, [orders, currentPeriod]);

  const currentMonthPurchases = useMemo(() => {
    return stockPurchases.reduce((sum, purchase) => {
      if (!isDateInPeriod(purchase?.createdAt, currentPeriod)) {
        return sum;
      }

      return sum + Number(purchase?.total || 0);
    }, 0);
  }, [stockPurchases, currentPeriod]);

  const currentMonthPaidExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => {
      if (expense?.period !== currentPeriod) {
        return sum;
      }

      if (expense?.status !== "paid") {
        return sum;
      }

      return sum + Number(expense?.amount || 0);
    }, 0);
  }, [expenses, currentPeriod]);

  const currentMonthPendingExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => {
      if (expense?.period !== currentPeriod) {
        return sum;
      }

      if (expense?.status === "paid") {
        return sum;
      }

      return sum + Number(expense?.amount || 0);
    }, 0);
  }, [expenses, currentPeriod]);

  const currentMoney = currentFinancePeriod?.isClosed
    ? Number(currentFinancePeriod?.closingBalance || 0)
    : startingBalance +
      currentMonthRevenue -
      currentMonthPurchases -
      currentMonthPaidExpenses;

  const monthlyResult =
    currentMonthRevenue - currentMonthPurchases - currentMonthPaidExpenses;

  // =========================================================
  // ASZTALOK REALTIME FIGYELÉSE
  // =========================================================

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

  // =========================================================
  // ASZTAL STATISZTIKA
  // =========================================================

  const tableStats = useMemo(() => {
    const free = tables.filter((table) => table.orders.length === 0);

    const busy = tables.filter((table) => table.orders.length > 0);

    return {
      free,
      busy,
    };
  }, [tables]);

  // =========================================================
  // AKTÍV RENDELÉSEK
  //
  // Egy asztalt egy aktív rendelésként
  // kezelünk a dashboardon.
  // =========================================================

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

  // =========================================================
  // RENDEZETLEN SZÁMLÁK
  // =========================================================

  const pendingExpenseList = useMemo(() => {
    return expenses
      .filter(
        (expense) =>
          expense?.period === currentPeriod && expense?.status !== "paid",
      )
      .sort((a, b) => {
        const dateA = a?.dueDate || "9999";

        const dateB = b?.dueDate || "9999";

        return dateA.localeCompare(dateB);
      })
      .slice(0, 5);
  }, [expenses, currentPeriod]);

  return (
    <Layout>
      <section className="admin">
        {/* ===================================================
            HEADER
           =================================================== */}

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
                <small>Rendszer</small>

                <strong>Aktív</strong>
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

        {/* ===================================================
            KPI
           =================================================== */}

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
              {criticalStockCount} alacsony · {outOfStockCount} elfogyott
            </span>
          </article>

          <article className="admin__statCard admin__statCard--money">
            <div className="admin__statTop">
              <div className="admin__statIcon">💵</div>

              <span className="admin__statCaption">Kávézó pénze</span>
            </div>

            <strong className="admin__statValue">
              {formatCurrency(currentMoney)} Ft
            </strong>

            <span className="admin__statMeta">
              {currentFinancePeriod?.isClosed
                ? "🔒 Hónap lezárva"
                : "🟢 Nyitott hónap"}
            </span>
          </article>
        </section>

        {/* ===================================================
            MAIN GRID
           =================================================== */}

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

              <Link to="/products" className="admin__panelLink">
                Termékek
              </Link>
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
                      to="/products"
                      key={product.id}
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
              RENDELÉS STÁTUSZOK
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

                <h2>
                  {today.toLocaleDateString("hu-HU", {
                    year: "numeric",
                    month: "long",
                  })}
                </h2>
              </div>

              <Link to="/business" className="admin__panelLink">
                Részletek
              </Link>
            </div>

            <div className="admin__financeRows">
              <div>
                <span>Kezdő pénzkészlet</span>

                <strong>{formatCurrency(startingBalance)} Ft</strong>
              </div>

              <div>
                <span>Havi bevétel</span>

                <strong className="admin__financePositive">
                  + {formatCurrency(currentMonthRevenue)} Ft
                </strong>
              </div>

              <div>
                <span>Beszerzések</span>

                <strong className="admin__financeNegative">
                  − {formatCurrency(currentMonthPurchases)} Ft
                </strong>
              </div>

              <div>
                <span>Rendezett kiadások</span>

                <strong className="admin__financeNegative">
                  − {formatCurrency(currentMonthPaidExpenses)} Ft
                </strong>
              </div>
            </div>

            <div className="admin__financeBalance">
              <span>Jelenlegi pénz</span>

              <strong>{formatCurrency(currentMoney)} Ft</strong>
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
                    to="/expenses"
                    key={expense.id}
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
            FOOTER SUMMARY
           =================================================== */}

        <footer className="admin__footerSummary">
          <div>
            <span>Havi eredmény</span>

            <strong
              className={
                monthlyResult >= 0
                  ? "admin__financePositive"
                  : "admin__financeNegative"
              }
            >
              {monthlyResult >= 0 ? "+" : "−"}{" "}
              {formatCurrency(Math.abs(monthlyResult))} Ft
            </strong>
          </div>

          <div>
            <span>Rendezetlen kiadások</span>

            <strong>{formatCurrency(currentMonthPendingExpenses)} Ft</strong>
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
