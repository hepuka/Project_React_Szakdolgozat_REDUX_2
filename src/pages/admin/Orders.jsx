import { useMemo, useState } from "react";
import "./Orders.scss";
import Layout from "../../components/Layout";
import useFetchCollection from "../../customHooks/useFetchCollection";
import { useNavigate } from "react-router-dom";

const MONTHS = [
  { value: "01", label: "Január" },
  { value: "02", label: "Február" },
  { value: "03", label: "Március" },
  { value: "04", label: "Április" },
  { value: "05", label: "Május" },
  { value: "06", label: "Június" },
  { value: "07", label: "Július" },
  { value: "08", label: "Augusztus" },
  { value: "09", label: "Szeptember" },
  { value: "10", label: "Október" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const getDateParts = (orderDate) => {
  if (!orderDate) {
    return {
      year: "",
      month: "",
    };
  }

  if (typeof orderDate?.toDate === "function") {
    const date = orderDate.toDate();

    return {
      year: String(date.getFullYear()),
      month: String(date.getMonth() + 1).padStart(2, "0"),
    };
  }

  // JavaScript Date
  if (orderDate instanceof Date) {
    return {
      year: String(orderDate.getFullYear()),
      month: String(orderDate.getMonth() + 1).padStart(2, "0"),
    };
  }

  const value = String(orderDate).trim();

  /*
   * 2026-08-27
   * 2026.08.27
   * 2026. 08. 27.
   * 2026/08/27
   */
  let match = value.match(/^(\d{4})[.\-/]\s*(\d{1,2})[.\-/]\s*\d{1,2}/);

  if (match) {
    return {
      year: match[1],
      month: String(match[2]).padStart(2, "0"),
    };
  }

  /*
   * 27.08.2026
   * 27. 08. 2026.
   * 27/08/2026
   * 27-08-2026
   */
  match = value.match(/^\d{1,2}[.\-/]\s*(\d{1,2})[.\-/]\s*(\d{4})/);

  if (match) {
    return {
      year: match[3],
      month: String(match[2]).padStart(2, "0"),
    };
  }

  /*
   * ISO dátum, például:
   * 2026-08-27T15:30:00
   */
  const parsedDate = new Date(value);

  if (!Number.isNaN(parsedDate.getTime())) {
    return {
      year: String(parsedDate.getFullYear()),
      month: String(parsedDate.getMonth() + 1).padStart(2, "0"),
    };
  }

  return {
    year: "",
    month: "",
  };
};

const Orders = () => {
  const data = useFetchCollection("kunpaosorders");
  const navigate = useNavigate();

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  const years = useMemo(() => {
    const uniqueYears = new Set();

    data.forEach((order) => {
      const { year } = getDateParts(order.orderDate);

      if (year) {
        uniqueYears.add(year);
      }
    });

    return Array.from(uniqueYears).sort((a, b) => b - a);
  }, [data]);

  const filteredOrders = useMemo(() => {
    return data.filter((order) => {
      const { year, month } = getDateParts(order.orderDate);

      const matchesYear = !selectedYear || year === selectedYear;

      const matchesMonth = !selectedMonth || month === selectedMonth;

      return matchesYear && matchesMonth;
    });
  }, [data, selectedYear, selectedMonth]);

  const filteredTotalAmount = useMemo(() => {
    return filteredOrders.reduce(
      (total, order) => total + Number(order?.orderAmount || 0),
      0,
    );
  }, [filteredOrders]);

  const handleClick = (id) => {
    navigate(`/order-details/${id}`);
  };

  const getStatusClass = (status) => {
    if (!status) {
      return "orders__status--default";
    }

    return `orders__status--${String(status)
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
  };

  const clearFilters = () => {
    setSelectedYear("");
    setSelectedMonth("");
  };

  return (
    <Layout>
      <section className="orders">
        <header className="orders__header">
          <div>
            <span className="orders__eyebrow">Coffee Management</span>

            <h1>Rendelések</h1>

            <p>Tekintsd meg a rögzített rendelések részleteit és állapotát.</p>
          </div>

          <div className="orders__count">
            <div className="orders__countIcon">🧾</div>

            <div>
              <strong>{filteredOrders.length}</strong>
              <span>
                {filteredOrders.length === 1 ? "rendelés" : "rendelés"}
              </span>
            </div>
          </div>
        </header>

        <div className="orders__card">
          {/* =================================================
              SZŰRŐK
             ================================================= */}

          <div className="orders__filters">
            <div className="orders__filterTitle">
              <span className="orders__filterIcon">🔎</span>

              <div>
                <strong>Rendelések szűrése</strong>

                <span>Válaszd ki a megjeleníteni kívánt évet és hónapot.</span>
              </div>
            </div>

            <div className="orders__filterControls">
              <div className="orders__filterGroup">
                <label htmlFor="order-year">Év</label>

                <select
                  id="order-year"
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);

                    if (!e.target.value) {
                      setSelectedMonth("");
                    }
                  }}
                >
                  <option value="">Összes év</option>

                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="orders__filterGroup">
                <label htmlFor="order-month">Hónap</label>

                <select
                  id="order-month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="">Összes hónap</option>

                  {MONTHS.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>

              {(selectedYear || selectedMonth) && (
                <button
                  type="button"
                  className="orders__clearFilter"
                  onClick={clearFilters}
                >
                  Szűrés törlése
                </button>
              )}
            </div>
          </div>

          {/* =================================================
              FILTER SUMMARY
             ================================================= */}

          <div className="orders__filterSummary">
            <span>
              {selectedYear || selectedMonth
                ? "Aktuális szűrés:"
                : "Megjelenítés:"}
            </span>

            <strong>
              {!selectedYear && !selectedMonth
                ? "Összes rendelés"
                : `${selectedYear || "Minden év"} • ${
                    selectedMonth
                      ? MONTHS.find((month) => month.value === selectedMonth)
                          ?.label
                      : "Minden hónap"
                  }`}
            </strong>

            <span className="orders__summaryAmount">
              Összeg: {filteredTotalAmount.toLocaleString("hu-HU")} Ft
            </span>
          </div>

          {/* =================================================
              TABLE
             ================================================= */}

          {filteredOrders.length === 0 ? (
            <div className="orders__empty">
              <div className="orders__emptyIcon">🧾</div>

              <h2>Nincs rendelés a kiválasztott időszakban</h2>

              <p>A megadott évhez és hónaphoz nem található rendelés.</p>

              <button
                type="button"
                className="orders__clearFilter orders__clearFilter--empty"
                onClick={clearFilters}
              >
                Szűrés törlése
              </button>
            </div>
          ) : (
            <div className="orders__tableWrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Megrendelés</th>
                    <th>Végösszeg</th>
                    <th>Felszolgáló</th>
                    <th>Asztal</th>
                    <th>Állapot</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((item, index) => (
                    <tr
                      key={item.id}
                      onClick={() => handleClick(item.id)}
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleClick(item.id);
                        }
                      }}
                    >
                      <td>
                        <span className="orders__number">{index + 1}</span>
                      </td>

                      <td>
                        <div className="orders__date">
                          <strong>{item.orderDate || "—"}</strong>

                          <span>{item.orderTime || "—"}</span>
                        </div>
                      </td>

                      <td>
                        <strong className="orders__amount">
                          {Number(item.orderAmount || 0).toLocaleString(
                            "hu-HU",
                          )}{" "}
                          Ft
                        </strong>
                      </td>

                      <td>
                        <span className="orders__server">
                          {item.username || "—"}
                        </span>
                      </td>

                      <td>
                        <span className="orders__tableNumber">
                          {item.tablenumber || "—"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`orders__status ${getStatusClass(
                            item.orderStatus,
                          )}`}
                        >
                          {item.orderStatus || "Ismeretlen"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Orders;
