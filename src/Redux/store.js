import { configureStore, combineReducers } from "@reduxjs/toolkit";

import authReducer from "./slice/authSlice";
import productReducer from "./slice/productSlice";

/*
 * Két szelet maradt.
 *
 * - auth:    a bejelentkezett felhasználó neve, szerepköre,
 *            azonosítója. A munkamenetet oldalfrissítés után
 *            a useAuthListener állítja vissza a Firebase saját
 *            munkamenetéből, nem a böngésző tárolójából.
 *
 * - product: a valós idejű terméklista, a kiválasztott
 *            kategória és termék.
 *
 * Ami kikerült: a filterSlice (a szűrt lista most származtatott
 * érték), a tableSlice (az asztalok foglaltsága a Firestore-ból
 * jön), valamint a sosem használt orderSlice és userSlice.
 * A böngésző tárolójába semmit nem mentünk.
 */

const reducer = combineReducers({
  auth: authReducer,
  product: productReducer,
});

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
