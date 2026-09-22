import { createSelector, createSlice } from "@reduxjs/toolkit";

/* =========================================================
   TERMÉKEK
   =========================================================

   Ez a szelet tartja a teljes, valós idejű terméklistát, a
   kiválasztott kategóriát és a kiválasztott terméket.

   A szűrt lista NEM tárolt állapot: azt a selectFilteredProducts
   számolja ki a listából és a kategóriából. Korábban külön
   filterSlice tárolta a szűrt listát is, amit minden
   terméklista-frissítéskor külön kellett szinkronban tartani -
   ez volt a leggyakoribb hibaforrás.
   ========================================================= */

export const ALL_CATEGORIES = "Összes";

const initialState = {
  products: [],

  selectedCategory: ALL_CATEGORIES,

  selectedProduct: null,
};

const productSlice = createSlice({
  name: "product",

  initialState,

  reducers: {
    /*
     * A Firestore valós idejű terméklistája.
     */
    STORE_PRODUCTS(state, action) {
      state.products = action.payload?.products || [];
    },

    /*
     * A figyelő leállításakor.
     */
    CLEAR_PRODUCTS(state) {
      state.products = [];

      state.selectedProduct = null;
    },

    /*
     * Kategóriaválasztás.
     */
    SET_CATEGORY(state, action) {
      state.selectedCategory = action.payload?.trim() || ALL_CATEGORIES;
    },

    /*
     * Termékválasztás a rendelési felületen.
     */
    SET_SELECTEDPRODUCT(state, action) {
      state.selectedProduct = action.payload || null;
    },

    CLEAR_SELECTEDPRODUCT(state) {
      state.selectedProduct = null;
    },
  },
});

export const {
  STORE_PRODUCTS,
  CLEAR_PRODUCTS,
  SET_CATEGORY,
  SET_SELECTEDPRODUCT,
  CLEAR_SELECTEDPRODUCT,
} = productSlice.actions;

// =========================================================
// SELECTOROK
// =========================================================

export const selectProducts = (state) => state.product.products;

export const selectSelectedCategory = (state) =>
  state.product.selectedCategory;

export const selectSelectedProduct = (state) => state.product.selectedProduct;

/*
 * Származtatott érték: a kategóriára szűrt terméklista.
 *
 * A createSelector megjegyzi az eredményt, ezért csak akkor
 * számol újra, ha a terméklista vagy a kategória változik.
 */
export const selectFilteredProducts = createSelector(
  [selectProducts, selectSelectedCategory],
  (products, category) => {
    if (!category || category === ALL_CATEGORIES) {
      return products;
    }

    return products.filter(
      (product) => product?.category?.trim() === category,
    );
  },
);

export default productSlice.reducer;
