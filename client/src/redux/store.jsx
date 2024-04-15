import { configureStore } from '@reduxjs/toolkit';
import paletteReducer from './slices/paletteSlice';

const store = configureStore({
  reducer: {
    palette: paletteReducer,
  },
});

export default store;