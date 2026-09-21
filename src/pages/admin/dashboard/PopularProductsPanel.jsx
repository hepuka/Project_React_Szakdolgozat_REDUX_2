/* =========================================================
   IRÁNYÍTÓPULT - LEGNÉPSZERŰBB TERMÉKEK
   ========================================================= */

import Icon from "../../../components/Icon";

const PopularProductsPanel = ({ popularProducts, maxPopularProduct }) => {
  return (
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
          <Icon name="coffee" size={22} />

          <p>Ma még nincs elegendő értékesítési adat.</p>
        </div>
      ) : (
        <div className="admin__popularList">
          {popularProducts.map((item, index) => (
            <div key={item.name} className="admin__popularRow">
              <div className="admin__popularRank">{index + 1}</div>

              <div className="admin__popularIcon">
                <Icon name="coffee" size={15} />
              </div>

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
  );
};

export default PopularProductsPanel;
