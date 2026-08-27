import { useMemo } from "react";
import Layout from "../../components/Layout";
import useFetchCollection from "../../customHooks/useFetchCollection";
import "./Business.scss";

const Business = () => {
  const orders = useFetchCollection("kunpaosorders");
  const products = useFetchCollection("kunpaosproducts");

  /* =========================================================
     ÖSSZES BEVÉTEL
     ========================================================= */

  const totalAmount = useMemo(() => {
    return orders.reduce(
      (total, order) => total + Number(order?.orderAmount || 0),
      0,
    );
  }, [orders]);

  /* =========================================================
     RENDELÉSI STATISZTIKA
     ========================================================= */

  const averageOrder = useMemo(() => {
    if (!orders.length) {
      return 0;
    }

    return totalAmount / orders.length;
  }, [orders, totalAmount]);

  /* =========================================================
     KATEGÓRIA STATISZTIKA
     ========================================================= */

  const categoryStats = useMemo(() => {
    const categories = {};

    products.forEach((product) => {
      const category = product?.category?.trim();

      if (!category) {
        return;
      }

      categories[category] = (categories[category] || 0) + 1;
    });

    return Object.entries(categories)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  const maxCategoryCount = Math.max(
    ...categoryStats.map((item) => item.count),
    1,
  );

  /* =========================================================
     UTOLSÓ 7 NAP RENDELÉSEI
     ========================================================= */

  const last7Days = useMemo(() => {
    const result = [];

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date();

      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      const dateString = `${year}-${month}-${day}`;

      const matchingOrders = orders.filter((order) => {
        if (!order?.orderDate) {
          return false;
        }

        return order.orderDate === dateString;
      });

      const amount = matchingOrders.reduce(
        (sum, order) => sum + Number(order?.orderAmount || 0),
        0,
      );

      result.push({
        date: dateString,
        label: `${String(date.getDate()).padStart(2, "0")}.`,
        count: matchingOrders.length,
        amount,
      });
    }

    return result;
  }, [orders]);

  const maxDailyAmount = Math.max(...last7Days.map((day) => day.amount), 1);

  const maxDailyOrders = Math.max(...last7Days.map((day) => day.count), 1);

  /* =========================================================
     FORMÁZÁS
     ========================================================= */

  const formatCurrency = (value) => Number(value || 0).toLocaleString("hu-HU");

  return (
    <Layout>
      <section className="business">
        {/* ===================================================
            HEADER
           =================================================== */}

        <header className="business__header">
          <div>
            <span className="business__eyebrow">Analytics & Reports</span>

            <h1>Üzleti összesítő</h1>

            <p>A kávézó aktuális forgalmi és termékadatai egy helyen.</p>
          </div>
        </header>

        {/* ===================================================
            KPI CARDS
           =================================================== */}

        <div className="business__stats">
          {/* BEVÉTEL */}

          <article className="business__card">
            <div className="business__cardHeader">
              <div className="business__icon">💰</div>

              <div>
                <span className="business__label">Összes bevétel</span>

                <strong className="business__value">
                  {formatCurrency(totalAmount)} Ft
                </strong>
              </div>
            </div>

            <div className="business__chart business__chart--revenue">
              <div className="business__chartHeader">
                <span>Utolsó 7 nap</span>

                <span>Átlag: {formatCurrency(averageOrder)} Ft</span>
              </div>

              <div className="business__bars">
                {last7Days.map((day) => (
                  <div
                    key={day.date}
                    className="business__barColumn"
                    title={`${day.label} ${formatCurrency(day.amount)} Ft`}
                  >
                    <div
                      className="business__bar"
                      style={{
                        height: `${Math.max(
                          (day.amount / maxDailyAmount) * 100,
                          day.amount > 0 ? 7 : 2,
                        )}%`,
                      }}
                    />

                    <span>{day.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* TERMÉKEK */}

          <article className="business__card">
            <div className="business__cardHeader">
              <div className="business__icon">☕</div>

              <div>
                <span className="business__label">Termékek száma</span>

                <strong className="business__value">
                  {products.length}
                  <small> db</small>
                </strong>
              </div>
            </div>

            <div className="business__categoryChart">
              {categoryStats.length === 0 ? (
                <div className="business__chartEmpty">Nincs kategória adat</div>
              ) : (
                categoryStats.slice(0, 5).map((category) => (
                  <div key={category.name} className="business__categoryRow">
                    <div className="business__categoryInfo">
                      <span>{category.name}</span>

                      <strong>{category.count}</strong>
                    </div>

                    <div className="business__categoryTrack">
                      <div
                        className="business__categoryBar"
                        style={{
                          width: `${
                            (category.count / maxCategoryCount) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          {/* RENDELÉSEK */}

          <article className="business__card">
            <div className="business__cardHeader">
              <div className="business__icon">🧾</div>

              <div>
                <span className="business__label">Összes megrendelés</span>

                <strong className="business__value">
                  {orders.length}
                  <small> db</small>
                </strong>
              </div>
            </div>

            <div className="business__ordersChart">
              <div className="business__chartHeader">
                <span>Rendelések / nap</span>

                <strong>
                  {Math.max(...last7Days.map((day) => day.count), 0)} max.
                </strong>
              </div>

              <div className="business__miniBars">
                {last7Days.map((day) => (
                  <div
                    key={day.date}
                    className="business__miniBarColumn"
                    title={`${day.label} - ${day.count} rendelés`}
                  >
                    <div
                      className="business__miniBar"
                      style={{
                        height: `${Math.max(
                          (day.count / maxDailyOrders) * 100,
                          day.count > 0 ? 8 : 3,
                        )}%`,
                      }}
                    />

                    <span>{day.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>

        {/* ===================================================
            ALSÓ ÖSSZEGZŐ PANEL
           =================================================== */}

        <div className="business__bottom">
          <div className="business__bottomCard">
            <div className="business__bottomIcon">📈</div>

            <div>
              <span>Átlagos rendelési érték</span>

              <strong>{formatCurrency(averageOrder)} Ft</strong>
            </div>
          </div>

          <div className="business__bottomCard">
            <div className="business__bottomIcon">📦</div>

            <div>
              <span>Kategóriák száma</span>

              <strong>{categoryStats.length} kategória</strong>
            </div>
          </div>

          <div className="business__bottomCard">
            <div className="business__bottomIcon">🛒</div>

            <div>
              <span>Legnagyobb kategória</span>

              <strong>{categoryStats[0]?.name || "—"}</strong>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Business;
