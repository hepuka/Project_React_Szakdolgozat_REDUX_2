import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  filteredProducts: [],
  selectedproduct: null,
  selectedCategory: "Összes",
};

const filterSlice = createSlice({
  name: "filter",

  initialState,

  reducers: {
    // =====================================================
    // KERESÉS
    // =====================================================

    FILTER_BY_SEARCH(state, action) {
      const { products, search } = action.payload;

      const searchValue = search?.toLowerCase().trim() || "";

      if (!searchValue) {
        state.filteredProducts = [...products];

        return;
      }

      state.filteredProducts = products.filter(
        (item) =>
          item?.name?.toLowerCase().includes(searchValue) ||
          item?.category?.toLowerCase().includes(searchValue),
      );
    },

    // =====================================================
    // RENDEZÉS
    // =====================================================

    SORT_PRODUCTS(state, action) {
      const { products, sort } = action.payload;

      let tempProducts = [...products];

      switch (sort) {
        case "Latest":
          tempProducts = [...products];
          break;

        case "lowest-price":
          tempProducts.sort(
            (a, b) => Number(a.price || 0) - Number(b.price || 0),
          );
          break;

        case "highest-price":
          tempProducts.sort(
            (a, b) => Number(b.price || 0) - Number(a.price || 0),
          );
          break;

        case "a-z":
          tempProducts.sort((a, b) =>
            (a.name || "").localeCompare(b.name || "", "hu"),
          );
          break;

        case "z-a":
          tempProducts.sort((a, b) =>
            (b.name || "").localeCompare(a.name || "", "hu"),
          );
          break;

        default:
          tempProducts = [...products];
      }

      state.filteredProducts = tempProducts;
    },

    // =====================================================
    // KATEGÓRIA SZŰRÉS
    // =====================================================

    FILTER_BY_CATEGORY(state, action) {
      const { products, category } = action.payload;

      const selectedCategory = category || "Összes";

      state.selectedCategory = selectedCategory;

      if (selectedCategory === "Összes") {
        state.filteredProducts = [...products];

        return;
      }

      state.filteredProducts = products.filter(
        (product) => product?.category?.trim() === selectedCategory.trim(),
      );
    },

    // =====================================================
    // REALTIME TERMÉKFRISSÍTÉS
    // =====================================================

    SYNC_PRODUCTS(state, action) {
      const products = action.payload?.products || [];

      state.filteredProducts =
        state.selectedCategory === "Összes"
          ? [...products]
          : products.filter(
              (product) =>
                product?.category?.trim() === state.selectedCategory.trim(),
            );

      /*
       * A kiválasztott terméket is frissítjük
       * az új Firestore-adattal.
       */

      if (state.selectedproduct?.id) {
        const updatedProduct = products.find(
          (product) => product.id === state.selectedproduct.id,
        );

        if (updatedProduct) {
          state.selectedproduct = updatedProduct;
        } else {
          state.selectedproduct = null;
        }
      }
    },

    // =====================================================
    // TERMÉK KIVÁLASZTÁSA
    // =====================================================

    SET_SELECTEDPRODUCT(state, action) {
      state.selectedproduct = action.payload?.selectedproduct || null;
    },

    // =====================================================
    // KIVÁLASZTOTT TERMÉK TÖRLÉSE
    // =====================================================

    CLEAR_SELECTEDPRODUCT(state) {
      state.selectedproduct = null;
    },

    // =====================================================
    // SZŰRÉS VISSZAÁLLÍTÁSA
    // =====================================================

    CLEAR_CATEGORY_FILTER(state, action) {
      const products = action.payload?.products || [];

      state.selectedCategory = "Összes";

      state.filteredProducts = [...products];
    },

    RESET_FILTERS(state, action) {
      const products = action.payload?.products || [];

      state.selectedCategory = "Összes";

      state.filteredProducts = [...products];
    },
  },
});

export const {
  FILTER_BY_SEARCH,
  SORT_PRODUCTS,
  FILTER_BY_CATEGORY,
  SYNC_PRODUCTS,
  SET_SELECTEDPRODUCT,
  CLEAR_SELECTEDPRODUCT,
  CLEAR_CATEGORY_FILTER,
  RESET_FILTERS,
} = filterSlice.actions;

// =========================================================
// SELECTORS
// =========================================================

export const selectFilteredProducts = (state) => state.filter.filteredProducts;

export const selectSelectedProduct = (state) => state.filter.selectedproduct;

export const selectSelectedCategory = (state) => state.filter.selectedCategory;

export default filterSlice.reducer;
