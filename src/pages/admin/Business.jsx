import React from "react";
import Layout from "../../components/Layout";
import useFetchCollection from "../../customHooks/useFetchCollection";
import "./Business.scss";

const Business = () => {
  const orders = useFetchCollection("kunpaosorders");
  const products = useFetchCollection("kunpaosproducts");
  const array = [];

  orders.map((item) => {
    return array.push(item.orderAmount);
  });

  const totalAmount = array.reduce((a, b) => {
    return a + b;
  }, 0);

  return (
    <Layout>
      <div className="business">
        <h1>Üzleti összesítő</h1>
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
