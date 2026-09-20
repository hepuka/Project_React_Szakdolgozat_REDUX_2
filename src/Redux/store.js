import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import productReducer from "./slice/productSlice";
import userReducer from "./slice/userSlice";
import filterReducer from "./slice/filterSlice";
import orderReducer from "./slice/orderSlice";
import tableReducer from "./slice/tableSlice";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";

/*
 * Csak az asztalonkénti tételszámláló marad a localStorage-ban.
 *
 * Az auth állapotot szándékosan NEM perzisztáljuk: korábban a
 * szerepkör és a PIN kód is a böngésző tárolójában végezte. A
 * munkamenetet oldalfrissítés után a useAuthListener állítja
 * vissza a Firebase saját munkamenetéből.
 */

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["table"],
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
