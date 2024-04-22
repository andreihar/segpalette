import React, { useEffect, useState } from 'react';
import { HuePicker } from 'react-color';
import { useSelector, useDispatch } from 'react-redux';
import { setNewPalettes } from '../redux/slices/paletteSlice';
import { setOverlayVisible,setUpdateImage } from '../redux/slices/editorSlice';

function Sidebar() {
  const oldPalettes = useSelector((state) => state.palette.palettes.palettes);
  const newPalettes = useSelector((state) => state.palette.palettes.newPalettes);
  const indexes = useSelector((state) =>  state.palette.palettes.index);
  const overlayVisible = useSelector((state) => state.editor.overlayVisible);
  const dispatch = useDispatch();
  const [palettes, setPalettes] = useState(oldPalettes);
  const [selectedPaletteId, setSelectedPaletteId] = useState(null);
  const selectedPalette = palettes[selectedPaletteId];

  useEffect(() => {
    if(palettes.length === 0){
      setPalettes(oldPalettes)
    }
    if(newPalettes.length === 0){
      return;
    }
    setPalettes(newPalettes)
  },[newPalettes, oldPalettes]);

  const handleColourChange = (colourEvent, index) => {
    const modPalettes = [...palettes];
    modPalettes[index] = colourEvent.hex;
    dispatch(setNewPalettes([...modPalettes]));
  };

  const handleFinishEditing = () => {
    dispatch(setUpdateImage(true));
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