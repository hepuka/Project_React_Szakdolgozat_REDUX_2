import { useMemo } from "react";
import { useSelector } from "react-redux";

import Layout from "../../components/Layout";
import useFetchCollection from "../../customHooks/useFetchCollection";
import { selectUserName } from "../../Redux/slice/authSlice";

import "./Admin.scss";

const getDateFromOrder = (order) => {
  if (!order?.orderDate) {
    return null;
  }

  const value = String(order.orderDate).trim();

  // YYYY-MM-DD
  // YYYY.MM.DD
  // YYYY/MM/DD
  const isoMatch = value.match(/^(\d{4})[./-]\s*(\d{1,2})[./-]\s*(\d{1,2})/);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;

    const date = new Date(Number(year), Number(month) - 1, Number(day));

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  // DD.MM.YYYY
  // DD/MM/YYYY
  // DD-MM-YYYY
  const euMatch = value.match(/^(\d{1,2})[./-]\s*(\d{1,2})[./-]\s*(\d{4})/);

  if (euMatch) {
    const [, day, month, year] = euMatch;

    const date = new Date(Number(year), Number(month) - 1, Number(day));

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  // ISO timestamp vagy más értelmezhető dátum
  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getStatusKey = (status) => {
  return String(status || "ismeretlen")
    .trim()
    .toLowerCase();
};

const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString("hu-HU");
};

const Admin = () => {
  const currentUser = useSelector(selectUserName);

  const orders = useFetchCollection("kunpaosorders");
  const products = useFetchCollection("kunpaosproducts");

  const today = new Date();

  const dateLabel = today.toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const firstName = currentUser
    ? currentUser.trim().split(/\s+/)[0]
    : "Felhasználó";

  // =========================================================
  // ÖSSZES BEVÉTEL
  // =========================================================

  const totalRevenue = useMemo(() => {
    return orders.reduce(
      (sum, order) => sum + Number(order?.orderAmount || 0),
      0,
    );
  }, [orders]);

  // =========================================================
  // ÁTLAGOS RENDELÉSI ÉRTÉK
  // =========================================================

  const averageOrder = useMemo(() => {
    if (!orders.length) {
      return 0;
    }

    return totalRevenue / orders.length;
  }, [orders, totalRevenue]);

  // =========================================================
  // UTOLSÓ 7 NAP
  // =========================================================

  const last7Days = useMemo(() => {
    const days = [];

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(today);

      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      const ordersOfDay = orders.filter((order) => {
        const orderDate = getDateFromOrder(order);

        if (!orderDate) {
          return false;
        }

        return (
          orderDate.getFullYear() === date.getFullYear() &&
          orderDate.getMonth() === date.getMonth() &&
          orderDate.getDate() === date.getDate()
        );
      });

      const amount = ordersOfDay.reduce(
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
        orders: ordersOfDay.length,
      });
    }

    return days;
  }, [orders]);

  const maxDailyRevenue = Math.max(...last7Days.map((day) => day.amount), 1);

  const todayRevenue = last7Days[last7Days.length - 1]?.amount || 0;

  const todayOrders = last7Days[last7Days.length - 1]?.orders || 0;

  // =========================================================
  // RENDELÉSEK ÁLLAPOTA
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
  // LEGNÉPSZERŰBB TERMÉKEK
  // =========================================================

  const popularProducts = useMemo(() => {
    const productMap = {};

    orders.forEach((order) => {
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
  }, [orders]);

  const maxPopularProduct = Math.max(
    ...popularProducts.map((item) => item.amount),
    1,
  );

  return (
    <Layout>
      <section className="admin">
        {/* ===================================================
            HEADER
           =================================================== */}

        <header className="admin__header">
          <div>
            <span className="admin__eyebrow">Coffee Management Dashboard</span>

            <h1>Jó reggelt, {firstName}</h1>
          </div>

          <div className="admin__headerLogo">
            <p className="admin__date">{dateLabel}</p>
          </div>
        </header>

        {/* ===================================================
            STATISZTIKÁK
           =================================================== */}

        <div className="admin__stats">
          {/* BEVÉTEL */}

          <article className="admin__statCard">
            <div className="admin__statTop">
              <div className="admin__statIcon">💰</div>

              <span className="admin__statCaption">Összes bevétel</span>
            </div>

            <strong className="admin__statValue">
              {formatCurrency(totalRevenue)} Ft
            </strong>

            <span className="admin__statMeta">
              Mai nap: {formatCurrency(todayRevenue)} Ft
            </span>
          </article>

          {/* RENDELÉSEK */}

          <article className="admin__statCard">
            <div className="admin__statTop">
              <div className="admin__statIcon">🧾</div>

              <span className="admin__statCaption">Összes rendelés</span>
            </div>

            <strong className="admin__statValue">{orders.length}</strong>

            <span className="admin__statMeta">Ma: {todayOrders} rendelés</span>
          </article>

          {/* TERMÉKEK */}

          <article className="admin__statCard">
            <div className="admin__statTop">
              <div className="admin__statIcon">☕</div>

              <span className="admin__statCaption">Termékek</span>
            </div>

            <strong className="admin__statValue">{products.length}</strong>

            <span className="admin__statMeta">
              Átlagos rendelés: {formatCurrency(averageOrder)} Ft
            </span>
          </article>
        </div>

        {/* ===================================================
            GRAFIKONOK
           =================================================== */}

        <div className="admin__mainGrid">
          {/* BEVÉTELI GRAFIKON */}

          <article className="admin__panel admin__panel--revenue">
            <div className="admin__panelHeader">
              <div>
                <span className="admin__panelEyebrow">Revenue</span>

                <h2>Bevétel az elmúlt 7 napban</h2>
              </div>

              <span className="admin__panelValue">
                {formatCurrency(
                  last7Days.reduce((sum, day) => sum + day.amount, 0),
                )}{" "}
                Ft
              </span>
            </div>

            <div className="admin__revenueChart">
              <div className="admin__chartGrid">
                <span />
                <span />
                <span />
                <span />
              </div>

              <div className="admin__revenueBars">
                {last7Days.map((day) => (
                  <div
                    key={day.shortDate}
                    className="admin__revenueDay"
                    title={`${day.shortDate} • ${formatCurrency(
                      day.amount,
                    )} Ft`}
                  >
                    <div className="admin__revenueBarWrap">
                      <div
                        className="admin__revenueBar"
                        style={{
                          height: `${
                            day.amount > 0
                              ? Math.max(
                                  (day.amount / maxDailyRevenue) * 100,
                                  8,
                                )
                              : 3
                          }%`,
                        }}
                      />
                    </div>

                    <span>{day.shortDate}</span>

                    <small>{day.label.replace(".", "")}</small>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* RENDELÉS ÁLLAPOTOK */}

          <article className="admin__panel">
            <div className="admin__panelHeader">
              <div>
                <span className="admin__panelEyebrow">Orders</span>

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
        </div>

        {/* ===================================================
            LEGNÉPSZERŰBB TERMÉKEK
           =================================================== */}

        <article className="admin__panel admin__panel--popular">
          <div className="admin__panelHeader">
            <div>
              <span className="admin__panelEyebrow">Top products</span>

              <h2>Legnépszerűbb termékek</h2>
            </div>

            <span className="admin__panelBadge">Eladott mennyiség</span>
          </div>

          {popularProducts.length === 0 ? (
            <div className="admin__emptySmall">
              Még nincs elegendő rendelési adat a népszerűségi statisztikához.
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
                          width: `${(item.amount / maxPopularProduct) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </Layout>
  );
};

export default Admin;
