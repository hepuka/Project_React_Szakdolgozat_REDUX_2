import Layout from "../../components/Layout";
import "./Users.scss";
import useFetchCollection from "../../customHooks/useFetchCollection";
import { Link } from "react-router-dom";
import { confirmDelete } from "../../services/confirmDelete.js";

const Users = () => {
  const data = useFetchCollection("users");

  return (
    <Layout>
      <section className="users">
        <header className="users__header">
          <div>
            <span className="users__eyebrow">Adminisztráció</span>
            <h1>Regisztrált felhasználók</h1>
            <p>Felhasználói fiókok és jogosultságok kezelése.</p>
          </div>

          <Link to="/register/ADD" className="users__addButton">
            <span aria-hidden="true">＋</span>
            Új felhasználó
          </Link>
        </header>

        <div className="users__summary">
          <div className="users__summaryIcon">👥</div>
          <div>
            <strong>{data.length}</strong>
            <span>regisztrált felhasználó</span>
          </div>
        </div>

        {data.length > 0 ? (
          <div className="users__cardList">
            {data.map((item) => (
              <article key={item.id} className="users__card">
                <div className="users__cardHeader">
                  <div className="users__avatar">
                    {item.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <div className="users__identity">
                    <h2>{item.name || "Névtelen felhasználó"}</h2>
                    <span>{item.role || "Nincs megadva"}</span>
                  </div>

                  <span
                    className={`users__role ${
                      item.role === "Admin"
                        ? "users__role--admin"
                        : "users__role--default"
                    }`}
                  >
                    {item.role || "Felhasználó"}
                  </span>
                </div>

                <div className="users__details">
                  <div className="users__row">
                    <span className="users__label">E-mail</span>
                    <span className="users__value users__value--email">
                      {item.email || "—"}
                    </span>
                  </div>

                  <div className="users__row">
                    <span className="users__label">Adószám</span>
                    <span className="users__value">{item.tax || "—"}</span>
                  </div>
                </div>

                <div className="users__buttons">
                  <Link
                    to={`/register/${item.id}`}
                    className="users__editButton"
                  >
                    <span aria-hidden="true">✎</span>
                    Módosít
                  </Link>

                  <button
                    type="button"
                    className="users__deleteButton"
                    onClick={() => confirmDelete(item.id)}
                  >
                    <span aria-hidden="true">⌫</span>
                    Töröl
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="users__empty">
            <div className="users__emptyIcon">👥</div>
            <h2>Még nincs felhasználó</h2>
            <p>Hozd létre az első felhasználói fiókot a rendszerben.</p>

            <Link to="/register/ADD" className="users__addButton">
              <span aria-hidden="true">＋</span>
              Új felhasználó
            </Link>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Users;
