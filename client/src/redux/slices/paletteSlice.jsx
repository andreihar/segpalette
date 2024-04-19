import { createSlice } from '@reduxjs/toolkit';

const paletteSlice = createSlice({
  name: 'palette',
  initialState: { palettes: { index: 0, palettes: [] }, selectedColour: null },
  reducers: {
    setPalettes: (state, action) => {
      state.palettes.index = action.payload.index;
      state.palettes.palettes = action.payload.palettes;
    },
    setSelectedColour: (state, action) => {
      state.selectedColour = action.payload;
    },
  },
});

export const { setPalettes, setSelectedColour } = paletteSlice.actions;

export default paletteSlice.reducer;