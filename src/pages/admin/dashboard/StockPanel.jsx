/* =========================================================
   IRÁNYÍTÓPULT - KÉSZLETFIGYELMEZTETÉSEK
   ========================================================= */

import { Link } from "react-router-dom";

import Icon from "../../../components/Icon";

import { ROLES } from "../../../config/permissions";

const StockPanel = ({ stockAlerts, currentUserRole }) => {
  return (
    <article className="admin__panel">
      <div className="admin__panelHeader">
        <div>
          <span className="admin__panelEyebrow">Készlet</span>

          <h2>Figyelmeztetések</h2>
        </div>

        {currentUserRole !== ROLES.ADMIN && (
          <Link to="/products" className="admin__panelLink">
            Termékek
          </Link>
        )}
      </div>

      {stockAlerts.length === 0 ? (
        <div className="admin__emptySmall">
          <Icon name="check" size={22} />

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
  );
};

export default StockPanel;
