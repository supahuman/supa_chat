import { configureStore } from '@reduxjs/toolkit';
import { botApi } from './botApi';

export const store = configureStore({
  reducer: {
    [botApi.reducerPath]: botApi.reducer,
  },
  middleware: (getDefault) => getDefault().concat(botApi.middleware),
});


