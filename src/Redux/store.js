import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import productReducer from "./slice/productSlice";
import userReducer from "./slice/userSlice";
import filterReducer from "./slice/filterSlice";
import orderReducer from "./slice/orderSlice";
import tableReducer from "./slice/tableSlice";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
};

const reducer = combineReducers({
  auth: authReducer,
  product: productReducer,
  user: userReducer,
  filter: filterReducer,
  orders: orderReducer,
  table: tableReducer,
});

const persistedReducer = persistReducer(persistConfig, reducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
