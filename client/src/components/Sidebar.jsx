import React, { useState } from 'react';
import { HuePicker } from 'react-color';
import { useSelector, useDispatch } from 'react-redux';
import { setPalettes } from '../redux/slices/paletteSlice';
import { setOverlayVisible } from '../redux/slices/editorSlice';

function Sidebar() {
  const palettes = useSelector((state) => state.palette.palettes);
  const overlayVisible = useSelector((state) => state.editor.overlayVisible);
  const dispatch = useDispatch();

  const [selectedPaletteId, setSelectedPaletteId] = useState(null);

  const selectedPalette = palettes[selectedPaletteId];

  const handleColourChange = (colourEvent) => {
    const newPalettes = [...palettes];
    newPalettes[selectedPaletteId] = colourEvent.hex;
    dispatch(setPalettes(newPalettes));
  };

  const handleFinishEditing = () => {
    dispatch(setOverlayVisible(false));
  };

  const handleCancelEditing = () => {
    dispatch(setOverlayVisible(false));
  };

  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 bg-light h-100 text-center">
      <h3>Palette</h3>
      <hr />
      {selectedPalette && (
        <HuePicker color={`rgb(${selectedPalette})`} onChange={handleColourChange} style={{ width: '100%' }} />
      )}
      {overlayVisible && (
        <div>
          {palettes.map((colour, index) => {
            return (
              <input
                key={index}
                type="color"
                value={colour}
                onChange={(e) => handleColourChange({ hex: e.target.value }, index)} // Pass a color event to handleColourChange
              />
            );
          })}
        </div>
      )}
      {overlayVisible && (
  <div className="d-flex justify-content-around mt-3">
    <button className="btn btn-primary" onClick={handleFinishEditing}>Apply</button>
    <button className="btn btn-secondary" onClick={handleCancelEditing}>Cancel</button>
  </div>
)}
    </div>
  );
}

export default Sidebar;