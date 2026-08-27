import "./Orders.scss";
import Layout from "../../components/Layout";
import useFetchCollection from "../../customHooks/useFetchCollection";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const data = useFetchCollection("kunpaosorders");
  const navigate = useNavigate();

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
              <strong>{data.length}</strong>
              <span>rendelés</span>
            </div>
          </div>
        </header>

        <div className="orders__card">
          {data.length === 0 ? (
            <div className="orders__empty">
              <div className="orders__emptyIcon">🧾</div>

              <h2>Nincs regisztrált rendelés</h2>

              <p>Jelenleg még nincs megjeleníthető rendelés a rendszerben.</p>
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
                  {data.map((item, index) => (
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
                          {item.orderAmount ?? 0} Ft
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
