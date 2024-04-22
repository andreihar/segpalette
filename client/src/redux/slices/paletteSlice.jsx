import { createSlice } from '@reduxjs/toolkit';

const paletteSlice = createSlice({
  name: 'palette',
  initialState: { palettes: { index: 0, palettes: [], newPalettes:[] }, selectedColour: null },
  reducers: {
    setPalettes: (state, action) => {
      state.palettes.index = action.payload.index;
      state.palettes.palettes = action.payload.palettes;
    },
    setNewPalettes: (state,action) => {
      state.palettes.newPalettes = action.payload;
    },
    setSelectedColour: (state, action) => {
      state.selectedColour = action.payload;
    },
  },
});

export const { setPalettes, setSelectedColour, setNewPalettes } = paletteSlice.actions;

export default paletteSlice.reducer;