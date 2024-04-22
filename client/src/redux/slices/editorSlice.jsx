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
    setUpdateImage: (state,action) => {
      state.overlayVisible = false;
      state.updateImage = action.payload;
    },
    setJsonData: (state, action) => {
      state.jsonData = action.payload;
    },
  },
});

export const { setOverlayVisible, setUpdateImage, setJsonData } = editorSlice.actions;

export default editorSlice.reducer;