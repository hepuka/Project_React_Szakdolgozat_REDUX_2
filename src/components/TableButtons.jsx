import React from "react";
import "./TableButtons.scss";
import { useDispatch } from "react-redux";
import { FILTER_BY_CATEGORY } from "../Redux/slice/filterSlice";
import useFetchCollection from "../customHooks/useFetchCollection";

const TableButtons = () => {
  const dispatch = useDispatch();
  const products = useFetchCollection("kunpaosproducts");
  const allCategories = [
    "Összes",
    ...new Set(products.map((item) => item.category)),
  ];

  const filterProducts = (category) => {
    dispatch(
      FILTER_BY_CATEGORY({
        products: products,
        category: category,
      })
    );
  };

  return (
    <div className="placeorder__card placeorder__tablebuttons">
      <div className="placerorder__buttons">
        {allCategories.map((item, index) => {
          return (
            <div
              className="placeorder__button"
              key={index}
              onClick={() => filterProducts(item)}
            >
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TableButtons;
