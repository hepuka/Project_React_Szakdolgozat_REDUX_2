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
    SET_TABLESORDERS: (state, action) => {
      state.id = action.payload.id;
      state.length = action.payload.length;

      state.tableorders.map((item, index) => {
        if (index === action.payload.id - 1) {
          state.tableorders[index] = action.payload.length + 1;
        }
      });
    },
    SET_DELETETABLESORDERS: (state, action) => {
      state.id = action.payload.id;

      state.tableorders.map((item, index) => {
        if (index === action.payload.id - 1) {
          state.tableorders[index] = item -= 1;
        }
      });
    },

    SET_ZERO: (state, action) => {
      state.id = action.payload.id;

      state.tableorders.map((item, index) => {
        if (index === action.payload.id - 1) {
          state.tableorders[index] = item = 0;
        }
      });
    },
  },
});

export const { SET_TABLESORDERS, SET_DELETETABLESORDERS, SET_ZERO } =
  tableSlice.actions;

export const selectTableOrders = (state) => state.table.tableorders;

export default tableSlice.reducer;
