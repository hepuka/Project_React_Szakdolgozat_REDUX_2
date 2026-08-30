import React from "react";

import "./TableButtons.scss";

import { useDispatch } from "react-redux";

import { FILTER_BY_CATEGORY } from "../Redux/slice/filterSlice";

import useFetchCollection from "../customHooks/useFetchCollection";

const TableButtons = () => {
  const dispatch = useDispatch();

  const products = useFetchCollection("kunpaosproducts");

  const categories = Array.from(
    new Set(products.map((item) => item?.category?.trim()).filter(Boolean)),
  );

  const allCategories = ["Összes", ...categories];

  const filterProducts = (category) => {
    dispatch(
      FILTER_BY_CATEGORY({
        products,
        category,
      }),
    );
  };

  return (
    <div className="placeorder__card placeorder__tablebuttons">
      <div className="tableButtons__header">
        <div>
          <span>Kategóriák</span>

          <h2>Termék kiválasztása</h2>
        </div>
      </div>

      <div className="tableButtons__list">
        {allCategories.map((category) => (
          <button
            type="button"
            key={category}
            className={`tableButtons__button ${
              category === "Összes" ? "tableButtons__button--active" : ""
            }`}
            onClick={() => filterProducts(category)}
          >
            <span className="tableButtons__icon">
              {category === "Összes" ? "☕" : "•"}
            </span>

            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TableButtons;
