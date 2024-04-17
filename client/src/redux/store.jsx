import { configureStore } from '@reduxjs/toolkit';
import paletteReducer from './slices/paletteSlice';
import editorReducer from './slices/editorSlice';

const store = configureStore({
  reducer: {
    palette: paletteReducer,
    editor: editorReducer,
  },
});

export default store;