import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: false,
  email: "",
  username: "",
  userRole: "",
  userPin: "",
  loggedUsers: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    SET_ACTIVE_USER: (state, action) => {
      const { email, userName, userRole, userPin } = action.payload;
      state.isLoggedIn = true;
      state.email = email;
      state.username = userName;
      state.userRole = userRole;
      state.userPin = userPin;
    },
    REMOVE_ACTIVE_USER: (state) => {
      state.isLoggedIn = false;
      state.email = null;
      state.username = null;
      state.userRole = null;
      state.userPin = null;
    },
  },
});

export const { SET_ACTIVE_USER, REMOVE_ACTIVE_USER } = authSlice.actions;

export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
export const selectEmail = (state) => state.auth.email;
export const selectUserName = (state) => state.auth.username;
export const selectUserRole = (state) => state.auth.userRole;
export const selectUserPin = (state) => state.auth.userPin;

export default authSlice.reducer;
