import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  tempProducts: [],
  selectedproduct: "",
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    STORE_PRODUCTS(state, action) {
      state.products = action.payload.products;
    },
  },
  SET_CATEGORY(state, action) {
    if (action.category === "Összes") {
      state.tempProducts = action.payload.product;
    } else {
      state.tempProducts = state.product.filter(
        (product) => product.category === action.category
      );
    }
  },
});

export const { STORE_PRODUCTS, GET_PRICE_RANGE } = productSlice.actions;

export const selectProducts = (state) => state.product.products;
export const selectTempProducts = (state) => state.products.tempProducts;
export const selectSelectedProducts = (state) => state.products.selectedproduct;

export default productSlice.reducer;
