/* =========================================================
   IRÁNYÍTÓPULT - FEJLÉC
   ========================================================= */

import Icon from "../../../components/Icon";

const DashboardHeader = ({ firstName, dateLabel, currentUserRole }) => {
  return (
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

        <div className="admin__headerLogo" aria-label="KunPao's Coffee">
          <Icon name="coffee" size={26} />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
