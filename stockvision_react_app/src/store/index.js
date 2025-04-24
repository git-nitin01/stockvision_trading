import { configureStore } from '@reduxjs/toolkit';
import popperReducer from './slices/popperSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    popper: popperReducer,
    auth: authReducer
  }
});


