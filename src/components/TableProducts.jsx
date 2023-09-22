import React from "react";
import "./TableProducts.scss";
import {
  SET_SELECTEDPRODUCT,
  selectFilteredProducts,
} from "../Redux/slice/filterSlice";
import { useDispatch, useSelector } from "react-redux";

const TableProducts = () => {
  const dispatch = useDispatch();
  const selectedFilteredProduct = useSelector(selectFilteredProducts);

  const selectedProduct = (item) => {
    dispatch(
      SET_SELECTEDPRODUCT({
        selectedproduct: item,
      })
    );
  };

  return (
    <div className="placeorder__card placeorder__tableproducts">
      <div className="placeorder__tableproductsCardList">
        {selectedFilteredProduct.map((item) => {
          return (
            <div
              className="placeorder__tableproductsCard"
              key={item.id}
              onClick={() => selectedProduct(item)}
            >
              <h2>{item.name}</h2>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TableProducts;
