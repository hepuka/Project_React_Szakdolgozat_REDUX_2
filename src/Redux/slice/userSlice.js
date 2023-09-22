import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    STORE_USERS(state, action) {
      state.users = action.payload.users;
    },
  },
});

export const { STORE_USERS } = userSlice.actions;

export const selectUsers = (state) => state.user.users;

export default userSlice.reducer;
