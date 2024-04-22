import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect } from 'react-konva';
import { generateColourPalette } from '../utils/generateColourPalette';
import { useSelector, useDispatch } from 'react-redux';
import { setPalettes } from '../redux/slices/paletteSlice';
import { setOverlayVisible, setUpdateImage,setJsonData } from '../redux/slices/editorSlice';
import { getMasks, getSegmentation } from '../services/PyService';
import StyledDropzone from './StyledDropzone';
import Modal from 'react-modal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import machuPicchuImage from '../assets/machu.jpg';
import machuPicchuJson from '../assets/machu.json';

function Canvas({ stageRef, setLoadMachuPicchu }) {
  Modal.setAppElement('#root');

  // Redux state
  const palettes = useSelector((state) => state.palette.palettes);
  const indexes = useSelector((state) =>  state.palette.palettes.index);
  const overlayVisible = useSelector((state) => state.editor.overlayVisible);
  const updateImage = useSelector((state) => {
  console.log({state})
  return state.editor.updateImage } )
  const jsonData = useSelector((state) => state.editor.jsonData);
  const dispatch = useDispatch();

  // Local state
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [masks, setMasks] = useState([]);
  const [selectedSegmentation, setSelectedSegmentation] = useState(null);
  const [overlaySegmentations, setOverlaySegmentations] = useState(null);
  const [overlaySegmentationsOpen, setOverlaySegmentationsOpen] = useState(true);


  const maskRefs = useRef([]);
  const updatedImages = useRef([]);


   // JSON file upload
  const onJsonFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const json = JSON.parse(e.target.result);
          dispatch(setJsonData(json));
        } catch (error) {
          console.error('Error parsing JSON file:', error);
          toast.error('Error parsing JSON file. Please try again');
          setSelectedImage(null);
          setIsLoading(false);
        }
      };
      reader.readAsText(file);
    }
  };

  // Produce JSON segmentation with SAM
  const generateSegmentation = () => {
    setIsLoading(true);
    console.log("Generating segmentation...");
    getSegmentation(selectedImage.src)
      .then(json => {
        dispatch(setJsonData(json));
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error processing image", error);
        toast.error('Error processing image. Please try again');
        setSelectedImage(null);
        setIsLoading(false);
      });
  };

  // Default Data
  const loadMachuPicchu = () => {
    const img = new Image();
    img.onload = () => {
      setIsLoading(true);
      setIsModalOpen(true);
      setSelectedImage(img);
      try {
        dispatch(setJsonData(machuPicchuJson));
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        toast.error('Error parsing JSON file. Please try again');
        setSelectedImage(null);
        setIsLoading(false);
        setIsModalOpen(false);
      }
    };
    img.src = machuPicchuImage;
  };

  useEffect(() => {
    setLoadMachuPicchu(() => loadMachuPicchu);
  }, []);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) {
      return;
    }

    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setSelectedImage(img);
        setIsModalOpen(true);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }, []);


  // Create mask canvas
  const createMaskCanvas = (mask) => {
    const canvas = Object.assign(document.createElement('canvas'), { width: mask.width, height: mask.height });
    const context = canvas.getContext('2d');
    context.drawImage(mask, 0, 0);
    return { canvas, context };
  };

  // Update image data
  const updateImageData = (imageData, originalImageData) => {
    for (let i = 0; i < imageData.data.length; i += 4) {
      const isWhite = imageData.data[i] === 255 && imageData.data[i + 1] === 255 && imageData.data[i + 2] === 255;
      if (isWhite) {
        imageData.data[i] = originalImageData.data[i];
        imageData.data[i + 1] = originalImageData.data[i + 1];
        imageData.data[i + 2] = originalImageData.data[i + 2];
        imageData.data[i + 3] = 255;
      } else {
        imageData.data[i] = 0;
        imageData.data[i + 1] = 0;
        imageData.data[i + 2] = 0;
        imageData.data[i + 3] = 0;
      }
    }
  };

///////////////////////////////////////////////////////////////
  function recolorPalette(indexList, oldPalette, newPalette) {
  // Adjust chromaticity of the new color to match the old color's chromaticity
  const adjustChromaticity = (oldColor, newColor) => {
    const oldRgb = hexToRgb(oldColor);
    const newRgb = hexToRgb(newColor);

    // Calculate the difference in chromaticity
    const dL = oldRgb.red - newRgb.red;
    const dA = oldRgb.green - newRgb.green;
    const dB = oldRgb.blue - newRgb.blue;

    // Subtract the chromaticity difference from the new color
    const r = Math.round(newRgb.red + dL);
    const g = Math.round(newRgb.green + dA);
    const b = Math.round(newRgb.blue + dB);

    // Return the adjusted RGB values
    return { red: isNaN(r) ? oldRgb.red : r, green: isNaN(g) ? oldRgb.green : g, blue: isNaN(b) ? oldRgb.blue : b };
  };

  // Convert hex color to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      red: parseInt(result[1], 16),
      green: parseInt(result[2], 16),
      blue: parseInt(result[3], 16)
    } : null;
  };

  // Iterate through the index list and adjust the chromaticity for each color
  const newColors = indexList.map(index => {
    if (index >= 0 && index < newPalette.length) {
      return adjustChromaticity(oldPalette[index], newPalette[index]);
    }
    // If the index is out of bounds, return a default color
    return { red: 0, green: 0, blue: 0 }; // Default color (black)
  });

  return newColors;
}


  const applyRecoloring = () => {
      if (!selectedSegmentation) return;

      // Create a canvas to work with the image data
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = selectedSegmentation.width;
      canvas.height = selectedSegmentation.height;

      // Create a new canvas and context from the segmented mask
      const { canvas: newCanvas, context: newContext } = createMaskCanvas(selectedSegmentation);
      const imageData = newContext.getImageData(0, 0, newCanvas.width, newCanvas.height);

      // Get the original image data
      const originalCanvas = document.createElement('canvas');
      const originalContext = originalCanvas.getContext('2d');
      originalCanvas.width = selectedSegmentation.width;
      originalCanvas.height = selectedSegmentation.height;
      originalContext.drawImage(selectedImage, 0, 0);
      const originalImageData = originalContext.getImageData(0, 0, originalCanvas.width, originalCanvas.height);

      // Recolor the pixels within the segmented mask
      const recolor = recolorPalette(indexes, palettes.palettes, palettes.newPalettes);
      recolor.forEach((color, index) => {
        if (imageData.data[index * 4 + 3] !== 0) { // Check if the pixel is part of the segmented mask
          imageData.data[index * 4] = color.red;
          imageData.data[index * 4 + 1] = color.green;
          imageData.data[index * 4 + 2] = color.blue;
          imageData.data[index * 4 + 3] = 255; // Set alpha channel to fully opaque
        } else { // If the pixel is not part of the mask, leave it unchanged
          imageData.data[index * 4] = originalImageData.data[index * 4];
          imageData.data[index * 4 + 1] = originalImageData.data[index * 4 + 1];
          imageData.data[index * 4 + 2] = originalImageData.data[index * 4 + 2];
          imageData.data[index * 4 + 3] = originalImageData.data[index * 4 + 3];
        }
      });

      // Put the modified image data back to the canvas
      newContext.putImageData(imageData, 0, 0);

      // Update selected image with recolored data
      const recoloredImage = new Image();
      recoloredImage.src = newCanvas.toDataURL();
      recoloredImage.onload = () => {
        setSelectedImage(recoloredImage);
      };

      console.log({recoloredImage});

      // Reset updateImage state
      dispatch(setUpdateImage(false));
    };

  useEffect(() => {
      console.log({updateImage});
      if(!updateImage) return;
      applyRecoloring();

  }, [updateImage]);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Generate Palette
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  useEffect(() => {
    if (selectedSegmentation) {
      canvas.width = selectedSegmentation.width;
      canvas.height = selectedSegmentation.height;
      context.drawImage(selectedSegmentation, 0, 0, selectedSegmentation.width, selectedSegmentation.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const palette = generateColourPalette(imageData);
      console.log('Colour palette:', palette);
      dispatch(setPalettes(palette));
    }
  }, [selectedSegmentation, dispatch]);

  // Handle mask click
  const handleMaskClick = (event) => {
    const { x, y } = event.target.getRelativePointerPosition();
    for (let index = updatedImages.current.length - 1; index >= 0; index--) {
      const mask = updatedImages.current[index];
      canvas.width = mask.width;
      canvas.height = mask.height;
      context.drawImage(mask, 0, 0, mask.width, mask.height);
      if (context.getImageData(Math.floor(x), Math.floor(y), 1, 1).data[3] !== 0) {
        console.log(`Mask ${index} clicked`);
        setSelectedSegmentation(mask);
        setOverlaySegmentationsOpen(false);
        dispatch(setOverlayVisible(true));
        break;
      }
    }
  };

  // Handle JSON file load
  useEffect(() => {
    if (jsonData) {
      getMasks(jsonData)
        .then(base64Images => {
          const loadedImages = base64Images.map((base64Image, index) => {
            const img = new Image();
            img.src = `data:image/png;base64,${base64Image}`;
            const ref = React.createRef();
            maskRefs.current[index] = ref;
            return img;
          });
          setMasks(loadedImages);
        })
        .catch(error => {
          toast.error('Error processing JSON file. Please make sure that the JSON file is a COCO segmentation file.');
          dispatch(setJsonData(null));
          setIsModalOpen(true);
          setIsLoading(false);
        })
        .finally(() => {
          setIsLoading(false);
          setIsModalOpen(false);
        });
    }
  }, [jsonData]);

  // Handle mask load
  useEffect(() => {
    if (selectedImage && selectedImage.complete) {
      const originalCanvas = document.createElement('canvas');
      originalCanvas.width = selectedImage.width;
      originalCanvas.height = selectedImage.height;
      const originalContext = originalCanvas.getContext('2d');
      originalContext.drawImage(selectedImage, 0, 0);
      const originalImageData = originalContext.getImageData(0, 0, originalCanvas.width, originalCanvas.height);

      masks.forEach((mask, index) => {
        if (mask.complete) {
          const { canvas, context } = createMaskCanvas(mask);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          updateImageData(imageData, originalImageData);
          context.putImageData(imageData, 0, 0);
          const newImage = new Image();
          newImage.onload = () => {
            maskRefs.current[index].current.image(newImage);
            updatedImages.current[index] = newImage;
          };
          newImage.src = canvas.toDataURL();
        }
      });
    }
  }, [masks, selectedImage]);

  // Create overlay of all segmentations
  useEffect(() => {
    if (selectedImage && selectedImage.complete && masks.length > 0) {
      const overlayCanvas = document.createElement('canvas');
      overlayCanvas.width = masks[0].width;
      overlayCanvas.height = masks[0].height;
      const overlayContext = overlayCanvas.getContext('2d');

      masks.forEach((mask) => {
        if (mask.complete) {
          const { canvas, context } = createMaskCanvas(mask);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const randomColour = { r: Math.floor(Math.random() * 256), g: Math.floor(Math.random() * 256), b: Math.floor(Math.random() * 256) };

          // 0 0 0 -> transparent
          // 255 255 255 -> semi-transparent and give it the random colour
          for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i] === 255 && imageData.data[i + 1] === 255 && imageData.data[i + 2] === 255) {
              imageData.data[i] = randomColour.r;
              imageData.data[i + 1] = randomColour.g;
              imageData.data[i + 2] = randomColour.b;
              imageData.data[i + 3] = 128; // semi-transparent
            } else {
              imageData.data[i + 3] = 0; // transparent
            }
          }
          context.putImageData(imageData, 0, 0);
          overlayContext.drawImage(canvas, 0, 0);
        }
      });

      const newImage = new Image();
      newImage.onload = () => {
        setOverlaySegmentations(newImage);
      };
      newImage.src = overlayCanvas.toDataURL();
    }
  }, [masks, selectedImage]);

  const toggleOverlay = () => {
    setOverlaySegmentationsOpen(!overlaySegmentationsOpen);
  };


  return (
    <>
      <ToastContainer />
      {selectedImage ? (
        <>
          {overlaySegmentations && (
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" role="switch" id="customSwitch1" checked={overlaySegmentationsOpen} onChange={toggleOverlay} disabled={overlayVisible} />
              <label className="form-check-label" htmlFor="customSwitch1">{overlaySegmentationsOpen ? 'Close Overlay' : 'Open Overlay'}</label>
            </div>
          )}
          <Modal isOpen={isModalOpen} style={{ content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', width: '400px' } }}>
            <div className="p-3 rounded text-center">
              {isLoading ? (
                <h2>Loading...</h2>
              ) : (
                <>
                  <h2 className="mb-3">Select an option</h2>
                  <button className="btn btn-primary mb-2" onClick={() => document.getElementById('json-upload').click()}>Upload COCO Segmentation file</button>
                  <input type="file" id="json-upload" accept=".json" onChange={onJsonFileChange} style={{ display: 'none' }} />
                  <button className="btn btn-secondary" onClick={generateSegmentation}>Generate segmentation</button>
                </>
              )}
            </div>
          </Modal>
          <Stage width={window.innerWidth} height={window.innerHeight} ref={stageRef}>
            <Layer>
              {selectedImage && <KonvaImage image={selectedImage} />}
              {masks.map((mask, index) => mask && (
                <KonvaImage
                  key={index}
                  ref={maskRefs.current[index] = React.createRef()}
                  globalCompositeOperation='source-over'
                  onClick={(event) => handleMaskClick(event, index)}
                />
              ))}
              {overlayVisible && (
                <>
                  <Rect
                    width={window.innerWidth}
                    height={window.innerHeight}
                    fill='black'
                    opacity={0.5}
                  />
                  {selectedSegmentation && <KonvaImage
                    image={selectedSegmentation}
                    globalCompositeOperation='source-over'
                  />}
                </>
              )}
              {overlaySegmentationsOpen && overlaySegmentations && <KonvaImage image={overlaySegmentations} listening={false} />}
            </Layer>
          </Stage>
        </>
      ) : (
        <main className="d-flex justify-content-center align-items-center min-height">
          <StyledDropzone onDrop={onDrop} />
        </main>
      )}
    </>
  );
}

export default Canvas;