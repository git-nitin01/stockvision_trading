import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  authPopper: 0
}

export const popperSlice = createSlice({
  name: 'popper',
  initialState,
  reducers: {
    openAuth: (state) => {
      state.authPopper = 1;
    },
    closeAuth: (state) => {
      state.authPopper = 0;
    }
  }
})

export const { openAuth, closeAuth } = popperSlice.actions;
export default popperSlice.reducer;
