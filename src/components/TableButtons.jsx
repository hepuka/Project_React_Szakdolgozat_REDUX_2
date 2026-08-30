import React from "react";

import "./TableButtons.scss";

import { useDispatch, useSelector } from "react-redux";

import {
  FILTER_BY_CATEGORY,
  selectSelectedCategory,
} from "../Redux/slice/filterSlice";

import { selectProducts } from "../Redux/slice/productSlice";

const TableButtons = () => {
  const dispatch = useDispatch();

  const products = useSelector(selectProducts);

  const selectedCategory = useSelector(selectSelectedCategory);

  const allCategories = Array.from(
    new Set(products.map((item) => item?.category?.trim()).filter(Boolean)),
  );

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
        <button
          type="button"
          className={`tableButtons__button ${
            selectedCategory === "Összes" ? "tableButtons__button--active" : ""
          }`}
          onClick={() => filterProducts("Összes")}
        >
          <span className="tableButtons__icon">☕</span>
          Összes
        </button>

        {allCategories.map((category) => (
          <button
            type="button"
            key={category}
            className={`tableButtons__button ${
              selectedCategory === category
                ? "tableButtons__button--active"
                : ""
            }`}
            onClick={() => filterProducts(category)}
          >
            <span className="tableButtons__icon">•</span>

            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TableButtons;
