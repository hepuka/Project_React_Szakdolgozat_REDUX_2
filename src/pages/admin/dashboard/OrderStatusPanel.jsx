/* =========================================================
   IRÁNYÍTÓPULT - RENDELÉSI ÁLLAPOTOK
   ========================================================= */


const OrderStatusPanel = ({ statusStats, maxStatusCount, orderCount }) => {
  return (
    <article className="admin__panel">
      <div className="admin__panelHeader">
        <div>
          <span className="admin__panelEyebrow">Rendelések</span>

          <h2>Rendelések állapota</h2>
        </div>

        <span className="admin__panelBadge">
          {orderCount} összesen
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
  );
};

export default OrderStatusPanel;
