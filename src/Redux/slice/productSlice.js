import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
};

const productSlice = createSlice({
  name: "product",

  initialState,

  reducers: {
    STORE_PRODUCTS(state, action) {
      state.products = action.payload?.products || [];
    },

    CLEAR_PRODUCTS(state) {
      state.products = [];
    },
  },
});

export const { STORE_PRODUCTS, CLEAR_PRODUCTS } = productSlice.actions;

// =========================================================
// SELECTOR
// =========================================================

export const selectProducts = (state) => state.product.products;

export default productSlice.reducer;
