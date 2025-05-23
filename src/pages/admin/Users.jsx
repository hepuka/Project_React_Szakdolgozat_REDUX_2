import Layout from "../../components/Layout";
import "./Users.scss";
import useFetchCollection from "../../customHooks/useFetchCollection";
import { Link } from "react-router-dom";
import { confirmDelete } from "../../services/confirmDelete.js";

const Users = () => {
  const data = useFetchCollection("users");

  return (
    <Layout>
      <div className="users">
        <div className="users__cardList">
          {data.map((item) => {
            return (
              <div key={item.id} className="users__card">
                <div className="users__rows">
                  <p>Név: </p> <span>{item.name}</span>
                </div>
                <div className="users__rows">
                  <p>Email: </p> <span>{item.email}</span>
                </div>
                <div className="users__rows">
                  <p>Jogosultság: </p> <span>{item.role}</span>
                </div>
                <div className="users__rows">
                  <p>Adószám: </p> <span>{item.tax}</span>
                </div>
                <div className="users__buttons">
                  <Link to={`/register/${item.id}`}>
                    <button id="update">Módosít</button>
                  </Link>

                  <button id="delete" onClick={() => confirmDelete(item.id)}>
                    Töröl
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Users;
