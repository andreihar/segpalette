import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  overlayVisible: false,
  jsonData: null,
};

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setOverlayVisible: (state, action) => {
      state.overlayVisible = action.payload;
    },
    setJsonData: (state, action) => {
      state.jsonData = action.payload;
    },
  },
});

export const { setOverlayVisible, setJsonData } = editorSlice.actions;

export default editorSlice.reducer;