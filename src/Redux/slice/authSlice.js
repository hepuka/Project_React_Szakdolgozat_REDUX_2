import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: false,
  email: "",
  name: "",
  role: "",
  pin: "",
  id:""
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    SET_ACTIVE_USER: (state, action) => {
      const { email, name, role, pin, id } = action.payload;
      state.isLoggedIn = true;
      state.email = email;
      state.name = name;
      state.role = role;
      state.pin = pin;
      state.id = id
    },
    REMOVE_ACTIVE_USER: (state) => {
      state.isLoggedIn = false;
      state.email = null;
      state.name = null;
      state.role = null;
      state.pin = null;
      state.id = null
    },
  },
});

export const { SET_ACTIVE_USER, REMOVE_ACTIVE_USER } = authSlice.actions;

export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
export const selectEmail = (state) => state.auth.email;
export const selectUserName = (state) => state.auth.name;
export const selectUserRole = (state) => state.auth.role;
export const selectUserPin = (state) => state.auth.pin;

export default authSlice.reducer;
