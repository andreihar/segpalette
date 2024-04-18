import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect } from 'react-konva';
import { generateColourPalette } from '../utils/generateColourPalette';
import { useSelector, useDispatch } from 'react-redux';
import { setPalettes } from '../redux/slices/paletteSlice';
import { setOverlayVisible, setJsonData } from '../redux/slices/editorSlice';
import { getMasks, getSegmentation } from '../services/PyService';
import StyledDropzone from './StyledDropzone';
import Modal from 'react-modal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import machuPicchuImage from '../assets/machu.jpg';
import machuPicchuJson from '../assets/machu.json';

function Canvas({ stageRef, setLoadMachuPicchu }) {
  // Redux state
  const palettes = useSelector((state) => state.palette.palettes);
  const overlayVisible = useSelector((state) => state.editor.overlayVisible);
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

  // Refs
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
        })
        .finally(() => {
          setIsLoading(false);
          setIsModalOpen(false);
        });
    }
  }, [selectedImage, jsonData]);

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