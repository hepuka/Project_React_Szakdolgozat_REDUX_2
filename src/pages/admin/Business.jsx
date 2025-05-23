import Layout from "../../components/Layout";
import useFetchCollection from "../../customHooks/useFetchCollection";
import "./Business.scss";

const Business = () => {
  const orders = useFetchCollection("kunpaosorders");
  const products = useFetchCollection("kunpaosproducts");
  const totalAmount = orders.reduce((acc, curr) => acc + curr.orderAmount, 0);

  return (
    <Layout>
      <div className="business">
        <div className="business__card business__card1">
          <h2>Összes bevétel:</h2>
          <h2>{totalAmount} Ft</h2>
        </div>
        <div className="business__card business__card2">
          <h2>Termékek száma:</h2>
          <h2>{products.length} darab</h2>
        </div>
        <div className="business__card business__card3">
          <h2>Összes megrendelés:</h2>
          <h2>{orders.length} darab</h2>
        </div>
      </div>
    </Layout>
  );
};

export default Business;
