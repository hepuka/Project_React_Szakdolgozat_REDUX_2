import React, { useEffect, useState } from "react";
import "./TableProductDetailsContainer.scss";
import { selectSelectedProduct } from "../Redux/slice/filterSlice";
import { useDispatch, useSelector } from "react-redux";
import Notiflix from "notiflix";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { SET_TABLESORDERS } from "../Redux/slice/tableSlice";

const TableProductDetailsContainer = ({ selectedTable, tableOrdersLength }) => {
  const setSelectedProduct = useSelector(selectSelectedProduct);
  const [count, setCount] = useState(1);
  const dispatch = useDispatch();

  const incrElement = async () => {
    dispatch(
      SET_TABLESORDERS({ id: selectedTable, length: tableOrdersLength })
    );
  };

  const decrease = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

  const increase = () => {
    setCount(count + 1);
  };

  const addToOrder = () => {
    try {
      addDoc(collection(db, `tableorders_${selectedTable}`), {
        id: new Date().getTime(),
        name: setSelectedProduct.name,
        price: setSelectedProduct.price,
        category: setSelectedProduct.category,
        packaging: setSelectedProduct.packaging,
        amount: count,
        sum: count * setSelectedProduct.price,
        tableNumber: Number(selectedTable),
        status: "Foglalt",
        createdAt: Timestamp.now().toDate(),
      });

      setCount(1);

      Notiflix.Notify.success("Rendelés hozzáadva!");
    } catch (error) {
      Notiflix.Notify.failure(error.message);
    }
  };

  return (
    <div className="placeorder__card placeorder__tableproductdetailsContainer">
      <div className="placeorder__tableproductdetails">
        {setSelectedProduct && (
          <>
            <div className="placeorder__tableproductdetailsdata">
              <h2>Név: {setSelectedProduct.name}</h2>
              <h2>Kategória: {setSelectedProduct.category}</h2>
              <h2>Kiszerelés: {setSelectedProduct.packaging}</h2>
              <h2>Egységár: {setSelectedProduct.price} Ft</h2>
            </div>
            <div className="placeorder__tableproductdetailssettings">
              <div className="placeorder__amountsettings">
                <div className="placeorder__set" onClick={decrease}>
                  -
                </div>
                <div>{count}</div>
                <div className="placeorder__set" onClick={increase}>
                  +
                </div>
              </div>
              <div>
                <button
                  disabled={selectedTable >= 1 ? false : true}
                  className="placeorder__setbutton"
                  onClick={() => {
                    addToOrder();
                    incrElement();
                  }}
                >
                  Hozzáad
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TableProductDetailsContainer;
