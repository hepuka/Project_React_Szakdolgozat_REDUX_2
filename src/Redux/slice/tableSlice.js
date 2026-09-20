import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tableorders: Array(10).fill(0),
  id: null,
  length: null,
};

const tableSlice = createSlice({
  name: "table",
  initialState,
  reducers: {
    /*
     * Egy asztalhoz tartozó tételszám beállítása.
     */
    SET_TABLESORDERS: (state, action) => {
      const index = action.payload.id - 1;

      state.id = action.payload.id;
      state.length = action.payload.length;

      if (index >= 0 && index < state.tableorders.length) {
        state.tableorders[index] = action.payload.length + 1;
      }
    },

    /*
     * Egy tétel törlése az asztalról.
     */
    SET_DELETETABLESORDERS: (state, action) => {
      const index = action.payload.id - 1;

      state.id = action.payload.id;

      if (index >= 0 && index < state.tableorders.length) {
        state.tableorders[index] = Math.max(
          0,
          Number(state.tableorders[index] || 0) - 1,
        );
      }
    },

    /*
     * Az asztal kiürítése fizetés után.
     */
    SET_ZERO: (state, action) => {
      const index = action.payload.id - 1;

      state.id = action.payload.id;

      if (index >= 0 && index < state.tableorders.length) {
        state.tableorders[index] = 0;
      }
    },
  },
});

export const { SET_TABLESORDERS, SET_DELETETABLESORDERS, SET_ZERO } =
  tableSlice.actions;

export const selectTableOrders = (state) => state.table.tableorders;

export default tableSlice.reducer;
