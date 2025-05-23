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

  return (
    <Layout>
      <div className="orders">
        <div className="orders__title">
          <h2>Válassz egy rendelést a részletek megtekintésére</h2>
        </div>

        <div className="orders__cardlist">
          {data.length === 0 ? (
            <p>Nincs regisztrált megrendelés</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Sorszám</th>
                  <th>Megrendelés</th>
                  <th>Rendelés végösszege (Ft)</th>
                  <th>Felszolgáló neve</th>
                  <th>Asztal száma</th>
                  <th>Rendelés állapota</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => {
                  return (
                    <tr key={item.id} onClick={() => handleClick(item.id)}>
                      <td>{index + 1}</td>
                      <td>
                        {item.orderDate}, {item.orderTime}
                      </td>
                      <td>{item.orderAmount}</td>
                      <td>{item.username}</td>
                      <td>{item.tablenumber}</td>
                      <td>{item.orderStatus}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Orders;
