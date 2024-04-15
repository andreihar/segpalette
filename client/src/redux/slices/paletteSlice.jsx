import { createSlice } from '@reduxjs/toolkit';

const paletteSlice = createSlice({
  name: 'palette',
  initialState: { palettes: [], selectedColour: null },
  reducers: {
    setPalettes: (state, action) => {
      state.palettes = action.payload;
    },
    setSelectedColour: (state, action) => {
      state.selectedColour = action.payload;
    },
  },
});

export const { setPalettes, setSelectedColour } = paletteSlice.actions;

export default paletteSlice.reducer;