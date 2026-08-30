import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Aktuálisan megjelenített / szűrt termékek
  filteredProducts: [],

  // Kiválasztott termék
  selectedproduct: null,

  // Aktív kategória
  selectedCategory: "Összes",
};

const filterSlice = createSlice({
  name: "filter",

  initialState,

  reducers: {
    // =====================================================
    // REALTIME TERMÉKLISTA SZINKRONIZÁLÁSA
    // =====================================================

    SYNC_PRODUCTS(state, action) {
      const products = action.payload?.products || [];

      const category = state.selectedCategory || "Összes";

      if (category === "Összes") {
        state.filteredProducts = [...products];

        return;
      }

      state.filteredProducts = products.filter(
        (product) => product?.category?.trim() === category.trim(),
      );
    },

    // =====================================================
    // KERESÉS
    // =====================================================

    FILTER_BY_SEARCH(state, action) {
      const { products = [], search = "" } = action.payload || {};

      const searchValue = String(search).toLowerCase().trim();

      if (!searchValue) {
        state.filteredProducts = [...products];

        return;
      }

      state.filteredProducts = products.filter((item) => {
        const name = item?.name?.toLowerCase() || "";

        const category = item?.category?.toLowerCase() || "";

        const description = item?.desc?.toLowerCase() || "";

        return (
          name.includes(searchValue) ||
          category.includes(searchValue) ||
          description.includes(searchValue)
        );
      });
    },

    // =====================================================
    // RENDEZÉS
    // =====================================================

    SORT_PRODUCTS(state, action) {
      const { products = [], sort } = action.payload || {};

      let tempProducts = [...products];

      switch (sort) {
        case "Latest":
          tempProducts = [...products];
          break;

        case "lowest-price":
          tempProducts.sort(
            (a, b) => Number(a?.price || 0) - Number(b?.price || 0),
          );
          break;

        case "highest-price":
          tempProducts.sort(
            (a, b) => Number(b?.price || 0) - Number(a?.price || 0),
          );
          break;

        case "a-z":
          tempProducts.sort((a, b) =>
            (a?.name || "").localeCompare(b?.name || "", "hu"),
          );
          break;

        case "z-a":
          tempProducts.sort((a, b) =>
            (b?.name || "").localeCompare(a?.name || "", "hu"),
          );
          break;

        default:
          tempProducts = [...products];
      }

      state.filteredProducts = tempProducts;
    },

    // =====================================================
    // KATEGÓRIA
    // =====================================================

    FILTER_BY_CATEGORY(state, action) {
      const { products = [], category = "Összes" } = action.payload || {};

      const normalizedCategory = category?.trim() || "Összes";

      state.selectedCategory = normalizedCategory;

      if (normalizedCategory === "Összes") {
        state.filteredProducts = [...products];

        return;
      }

      state.filteredProducts = products.filter(
        (product) => product?.category?.trim() === normalizedCategory,
      );
    },

    // =====================================================
    // KIVÁLASZTOTT TERMÉK
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
    // KATEGÓRIA SZŰRÉS TÖRLÉSE
    // =====================================================

    CLEAR_CATEGORY_FILTER(state, action) {
      const products = action.payload?.products || [];

      state.selectedCategory = "Összes";

      state.filteredProducts = [...products];
    },

    // =====================================================
    // TELJES SZŰRÉS VISSZAÁLLÍTÁSA
    // =====================================================

    RESET_FILTERS(state, action) {
      const products = action.payload?.products || [];

      state.selectedCategory = "Összes";

      state.filteredProducts = [...products];
    },
  },
});

// =========================================================
// ACTIONS
// =========================================================

export const {
  SYNC_PRODUCTS,
  FILTER_BY_SEARCH,
  SORT_PRODUCTS,
  FILTER_BY_CATEGORY,
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
