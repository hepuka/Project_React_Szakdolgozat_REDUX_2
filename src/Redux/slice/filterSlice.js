import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  filteredProducts: [],
  selectedproduct: "",
};

const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    FILTER_BY_SEARCH(state, action) {
      const { products, search } = action.payload;
      const tempProducts = products.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.category.toLowerCase().includes(search.toLowerCase())
      );

      state.filteredProducts = tempProducts;
    },

    SORT_PRODUCTS(state, action) {
      const { products, sort } = action.payload;
      let tempProducts = [];

      if (sort === "Latest") {
        tempProducts = products;
      }

      if (sort === "lowest-price") {
        tempProducts = products.slice().sort((a, b) => {
          return a.price - b.price;
        });
      }

      if (sort === "highest-price") {
        tempProducts = products.slice().sort((a, b) => {
          return b.price - a.price;
        });
      }

      if (sort === "a-z") {
        tempProducts = products.slice().sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
      }
      if (sort === "z-a") {
        tempProducts = products.slice().sort((a, b) => {
          return b.name.localeCompare(a.name);
        });
      }

      state.filteredProducts = tempProducts;
    },

    FILTER_BY_CATEGORY(state, action) {
      const { products, category } = action.payload;
      let tempProducts = [];
      if (category === "Összes") {
        tempProducts = products;
      } else {
        tempProducts = products.filter(
          (product) => product.category === category
        );
      }
      state.filteredProducts = tempProducts;
    },

    SET_SELECTEDPRODUCT(state, action) {
      state.selectedproduct = action.payload.selectedproduct;
    },
  },
});

export const {
  FILTER_BY_SEARCH,
  SORT_PRODUCTS,
  FILTER_BY_CATEGORY,
  FILTER_BY_BRAND,
  FILTER_BY_PRICE,
  SET_SELECTEDPRODUCT,
} = filterSlice.actions;

export const selectFilteredProducts = (state) => state.filter.filteredProducts;
export const selectSelectedProduct = (state) => state.filter.selectedproduct;

export default filterSlice.reducer;
