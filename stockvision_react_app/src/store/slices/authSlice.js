import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  loading: true,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;
    },
    removeUser: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
})

export const { setUser, removeUser, setLoading } = authSlice.actions;
export default authSlice.reducer;
