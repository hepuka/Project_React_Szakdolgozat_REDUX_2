import Layout from "../../components/Layout";
import { Link, useParams } from "react-router-dom";
import "./OrderDetails.scss";
import useFetchDocument from "../../customHooks/useFetchDocument.js";

const OrderDetails = () => {
  const { id } = useParams();

  const order = useFetchDocument("kunpaosorders", id);

  const cartItems = order?.cartItems || [];

  const totalAmount = Number(order?.orderAmount || 0);

  return (
    <Layout>
      <section className="orderDetails">
        <header className="orderDetails__header">
          <div>
            <span className="orderDetails__eyebrow">Coffee Management</span>

            <h1>Megrendelés részletei</h1>

            <p>
              A rendeléshez tartozó adatok és a megrendelt termékek részletei.
            </p>
          </div>
        </header>

        <div className="orderDetails__card">
          <div className="orderDetails__summary">
            <div className="orderDetails__summaryItem">
              <span className="orderDetails__summaryIcon">🧾</span>

              <div>
                <small>Megrendelés azonosító</small>
                <strong>{order?.id || id || "—"}</strong>
              </div>
            </div>

            <div className="orderDetails__summaryItem">
              <span className="orderDetails__summaryIcon">💰</span>

              <div>
                <small>Rendelés összege</small>
                <strong>{totalAmount.toLocaleString("hu-HU")} Ft</strong>
              </div>
            </div>

            <div className="orderDetails__summaryItem">
              <span className="orderDetails__summaryIcon">📋</span>

              <div>
                <small>Rendelés állapota</small>

                <span
                  className={`orderDetails__status ${
                    order?.orderStatus
                      ? `orderDetails__status--${String(order.orderStatus)
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`
                      : ""
                  }`}
                >
                  {order?.orderStatus || "Ismeretlen"}
                </span>
              </div>
            </div>
          </div>

          <div className="orderDetails__sectionHeader">
            <div>
              <span className="orderDetails__sectionEyebrow">Order items</span>

              <h2>Megrendelt termékek</h2>
            </div>

            <span className="orderDetails__itemCount">
              {cartItems.length} tétel
            </span>
          </div>

          <div className="orderDetails__details">
            {cartItems.length === 0 ? (
              <div className="orderDetails__empty">
                <div className="orderDetails__emptyIcon">🧾</div>

                <h3>Nincsenek termékek</h3>

                <p>Ehhez a rendeléshez nem tartozik megjeleníthető termék.</p>
              </div>
            ) : (
              <div className="orderDetails__tableWrapper">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Termék neve</th>
                      <th>Egységár</th>
                      <th>Mennyiség</th>
                      <th>Végösszeg</th>
                    </tr>
                  </thead>

                  <tbody>
                    {cartItems.map((cart, index) => {
                      const price = Number(cart?.price || 0);
                      const amount = Number(cart?.amount || 0);
                      const itemTotal = price * amount;

                      return (
                        <tr key={cart?.id || `${cart?.name}-${index}`}>
                          <td>
                            <span className="orderDetails__number">
                              {index + 1}
                            </span>
                          </td>

                          <td>
                            <div className="orderDetails__productName">
                              {cart?.name || "Névtelen termék"}
                            </div>
                          </td>

                          <td>
                            <span className="orderDetails__unitPrice">
                              {price.toLocaleString("hu-HU")} Ft
                            </span>
                          </td>

                          <td>
                            <span className="orderDetails__quantity">
                              {amount} db
                            </span>
                          </td>

                          <td>
                            <strong className="orderDetails__itemTotal">
                              {itemTotal.toLocaleString("hu-HU")} Ft
                            </strong>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                  <tfoot>
                    <tr>
                      <td colSpan="4">
                        <strong>Rendelés végösszege</strong>
                      </td>

                      <td>
                        <strong className="orderDetails__grandTotal">
                          {totalAmount.toLocaleString("hu-HU")} Ft
                        </strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          <div className="orderDetails__footer">
            <Link to="/orders" className="orderDetails__footerButton">
              ← Vissza a rendelésekhez
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default OrderDetails;
