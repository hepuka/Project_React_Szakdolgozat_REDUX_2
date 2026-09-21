/* =========================================================
   IRÁNYÍTÓPULT - ADMIN / RENDSZERFELÜGYELET
   ========================================================= */

import { Link } from "react-router-dom";

import Icon from "../../../components/Icon";

import { ROLES } from "../../../config/permissions";

import { getDocumentDate } from "../../../services/financeCalculations";

const AdminSection = ({
  users,
  onlineUsers,
  userRoleStats,
  recentLogins,
  products,
  orders,
  financePeriods,
  expenses,
  adminAlerts,
}) => {
  return (
    <section className="admin__adminSection">
      <div className="admin__adminSectionHeader">
        <div>
          <span className="admin__eyebrow">Adminisztráció</span>

          <h2>Admin / rendszerfelügyelet</h2>

          <p>
            Felhasználók, jogosultságok és a rendszer állapotának
            áttekintése.
          </p>
        </div>

        <Link to="/users" className="admin__adminUsersButton">
          Felhasználók kezelése
        </Link>
      </div>

      <div className="admin__adminGrid">
        {/* =============================================
            FELHASZNÁLÓI ÁLLAPOT
           ============================================= */}

        <article className="admin__adminPanel">
          <div className="admin__panelHeader">
            <div>
              <span className="admin__panelEyebrow">Felhasználók</span>

              <h2>Felhasználói állapot</h2>
            </div>

            <span className="admin__panelBadge">
              {users.length} felhasználó
            </span>
          </div>

          <div className="admin__userStatusSummary">
            <div className="admin__userStatusMain">
              <span className="admin__userOnlineDot" />

              <div>
                <strong>{onlineUsers.length}</strong>

                <span>online</span>
              </div>
            </div>

            <div className="admin__userStatusOffline">
              <strong>
                {Math.max(users.length - onlineUsers.length, 0)}
              </strong>

              <span>offline</span>
            </div>
          </div>

          <div className="admin__userRoleMiniList">
            <div>
              <span>Admin</span>

              <strong>{userRoleStats[ROLES.ADMIN]}</strong>
            </div>

            <div>
              <span>Manager</span>

              <strong>{userRoleStats[ROLES.MANAGER]}</strong>
            </div>

            <div>
              <span>Leader</span>

              <strong>{userRoleStats[ROLES.LEADER]}</strong>
            </div>

            <div>
              <span>Employee</span>

              <strong>{userRoleStats[ROLES.EMPLOYEE]}</strong>
            </div>
          </div>
        </article>

        {/* =============================================
            JOGOSULTSÁGOK
           ============================================= */}

        <article className="admin__adminPanel">
          <div className="admin__panelHeader">
            <div>
              <span className="admin__panelEyebrow">Jogosultság</span>

              <h2>Szerepkörök</h2>
            </div>
          </div>

          <div className="admin__permissionList">
            <div className="admin__permissionRow">
              <div className="admin__permissionIcon">A</div>

              <span>Admin</span>

              <strong>{userRoleStats[ROLES.ADMIN]}</strong>
            </div>

            <div className="admin__permissionRow">
              <div className="admin__permissionIcon">M</div>

              <span>Manager</span>

              <strong>{userRoleStats[ROLES.MANAGER]}</strong>
            </div>

            <div className="admin__permissionRow">
              <div className="admin__permissionIcon">L</div>

              <span>Leader</span>

              <strong>{userRoleStats[ROLES.LEADER]}</strong>
            </div>

            <div className="admin__permissionRow">
              <div className="admin__permissionIcon">E</div>

              <span>Employee</span>

              <strong>{userRoleStats[ROLES.EMPLOYEE]}</strong>
            </div>
          </div>
        </article>

        {/* =============================================
            LEGUTÓBBI BEJELENTKEZÉSEK
           ============================================= */}

        <article className="admin__adminPanel">
          <div className="admin__panelHeader">
            <div>
              <span className="admin__panelEyebrow">Biztonság</span>

              <h2>Legutóbbi bejelentkezések</h2>
            </div>
          </div>

          {recentLogins.length === 0 ? (
            <div className="admin__emptySmall">
              <Icon name="users" size={22} />

              <p>Még nincs bejelentkezési adat.</p>
            </div>
          ) : (
            <div className="admin__recentLoginList">
              {recentLogins.map((user) => {
                const loginDate = getDocumentDate(user.last_login);

                return (
                  <div key={user.id} className="admin__recentLoginRow">
                    <div className="admin__recentLoginAvatar">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div className="admin__recentLoginInfo">
                      <strong>
                        {user.name || "Ismeretlen felhasználó"}
                      </strong>

                      <span>{user.role || "Ismeretlen szerepkör"}</span>
                    </div>

                    <div className="admin__recentLoginTime">
                      <strong>
                        {loginDate
                          ? loginDate.toLocaleDateString("hu-HU", {
                              month: "2-digit",
                              day: "2-digit",
                            })
                          : "—"}
                      </strong>

                      <span>
                        {loginDate
                          ? loginDate.toLocaleTimeString("hu-HU", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </article>

        {/* =============================================
            RENDSZERÁLLAPOT
           ============================================= */}

        <article className="admin__adminPanel">
          <div className="admin__panelHeader">
            <div>
              <span className="admin__panelEyebrow">Rendszer</span>

              <h2>Rendszerállapot</h2>
            </div>
          </div>

          <div className="admin__systemList">
            <div className="admin__systemRow">
              <span className="admin__systemStatusDot" />

              <span>Felhasználói adatok</span>

              <strong>{users.length} rekord</strong>
            </div>

            <div className="admin__systemRow">
              <span className="admin__systemStatusDot" />

              <span>Termékadatok</span>

              <strong>{products.length} rekord</strong>
            </div>

            <div className="admin__systemRow">
              <span className="admin__systemStatusDot" />

              <span>Rendelések</span>

              <strong>{orders.length} rekord</strong>
            </div>

            <div className="admin__systemRow">
              <span className="admin__systemStatusDot" />

              <span>Pénzügyi időszakok</span>

              <strong>{financePeriods.length} rekord</strong>
            </div>

            <div className="admin__systemRow">
              <span className="admin__systemStatusDot" />

              <span>Kiadások</span>

              <strong>{expenses.length} rekord</strong>
            </div>
          </div>
        </article>

        {/* =============================================
            ADMIN FIGYELMEZTETÉSEK
           ============================================= */}

        <article className="admin__adminPanel admin__adminPanel--alerts">
          <div className="admin__panelHeader">
            <div>
              <span className="admin__panelEyebrow">Figyelmeztetés</span>

              <h2>Admin figyelmeztetések</h2>
            </div>

            <span className="admin__panelBadge">
              {adminAlerts.length} elem
            </span>
          </div>

          {adminAlerts.length === 0 ? (
            <div className="admin__adminNoAlerts">
              <Icon name="check" size={22} />

              <div>
                <strong>Nincs kritikus figyelmeztetés</strong>

                <p>
                  A rendszer jelenlegi állapotában nincs azonnali
                  adminisztratív teendő.
                </p>
              </div>
            </div>
          ) : (
            <div className="admin__adminAlertList">
              {adminAlerts.map((alert, index) => (
                <div
                  key={`${alert.title}-${index}`}
                  className={`admin__adminAlert admin__adminAlert--${alert.type}`}
                >
                  <div className="admin__adminAlertIcon">
                    <Icon name={alert.icon} size={16} />
                  </div>

                  <div className="admin__adminAlertInfo">
                    <strong>{alert.title}</strong>

                    <span>{alert.description}</span>
                  </div>

                  <strong className="admin__adminAlertValue">
                    {alert.value}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  );
};

export default AdminSection;
