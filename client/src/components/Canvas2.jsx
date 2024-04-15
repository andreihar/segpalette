import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { generateColourPalette } from '../utils/generateColourPalette';
import { useSelector, useDispatch } from 'react-redux';
import { setPalettes } from '../redux/slices/paletteSlice';
import { getMasks, getSegmentation } from '../services/PyService';
import StyledDropzone from './StyledDropzone';
import Modal from 'react-modal';

function Canvas({ stageRef, overlayVisible, setOverlayVisible }) {
  // Redux state
  const palettes = useSelector((state) => state.palette.palettes);
  const dispatch = useDispatch();

  // Local state
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [masks, setMasks] = useState([]);
  const [selectedSegmentation, setSelectedSegmentation] = useState(null);
  const [selectedMaskIndex, setSelectedMaskIndex] = useState(null);
  const [selectedMaskRef, setSelectedMaskRef] = useState(null);
  const [jsonFile, setJsonFile] = useState(null);

  // Refs
  const maskRefs = useRef([]);
  const updatedImages = useRef([]);

  // JSON file upload
  const onJsonFileChange = (event) => {
    setJsonFile(event.target.files[0]);
    if (event.target.files[0]) {
      setIsLoading(true);
    }
  };

  // Produce JSON segmentation with SAM
  const generateSegmentation = () => {
    console.log("Generating segmentation...");
    setIsModalOpen(false);

    getSegmentation(selectedImage)
      .then(json => {
        setJsonFile(json);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error processing image", error);
        setIsLoading(false);
      });
  };

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

  // Generate random colour
  const generateRandomColour = () => ({ r: Math.floor(Math.random() * 256), g: Math.floor(Math.random() * 256), b: Math.floor(Math.random() * 256) });

  // Create mask canvas
  const createMaskCanvas = (mask) => {
    const canvas = Object.assign(document.createElement('canvas'), { width: mask.width, height: mask.height });
    const context = canvas.getContext('2d');
    context.drawImage(mask, 0, 0);
    return { canvas, context };
  };

  // Give masks a rnadom colour
  const updateImageData = (imageData, { r, g, b }) => {
    for (let i = 0; i < imageData.data.length; i += 4) {
      const isWhite = imageData.data[i] === 255 && imageData.data[i + 1] === 255 && imageData.data[i + 2] === 255;
      const isBlack = imageData.data[i] === 0 && imageData.data[i + 1] === 0 && imageData.data[i + 2] === 0;
      imageData.data.set(isWhite ? [r, g, b, 127] : (isBlack ? [0, 0, 0, 0] : [imageData.data[i], imageData.data[i + 1], imageData.data[i + 2], 255]), i);
    }
  };

  // Generate Palette
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const maskCanvas = document.createElement('canvas');
  const maskContext = maskCanvas.getContext('2d');

  useEffect(() => {
    if (selectedSegmentation) {
      canvas.width = selectedImage.width;
      canvas.height = selectedImage.height;
      context.drawImage(selectedImage, 0, 0, selectedImage.width, selectedImage.height);

      maskCanvas.width = selectedSegmentation.width;
      maskCanvas.height = selectedSegmentation.height;
      maskContext.drawImage(selectedSegmentation, 0, 0, selectedSegmentation.width, selectedSegmentation.height);

      const maskImageData = maskContext.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
      for (let i = 0; i < maskImageData.data.length; i += 4) {
        maskImageData.data[i] = maskImageData.data[i + 1] = maskImageData.data[i + 2] = 0;
        maskImageData.data[i + 3] = maskImageData.data[i + 3] > 0 ? 255 : 0;
      }
      maskContext.putImageData(maskImageData, 0, 0);

      context.globalCompositeOperation = 'destination-in';
      context.drawImage(maskCanvas, 0, 0, maskCanvas.width, maskCanvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      const palette = generateColourPalette(imageData);
      console.log('Colour palette:', palette);
      dispatch(setPalettes(palette));
    }
  }, [selectedSegmentation, selectedImage, dispatch]);

  // Handle mask click
  const handleMaskClick = (event, index) => {
    const { x, y } = event.target.getRelativePointerPosition();
    for (let index = updatedImages.current.length - 1; index >= 0; index--) {
      const mask = updatedImages.current[index];
      canvas.width = mask.width;
      canvas.height = mask.height;
      context.drawImage(mask, 0, 0, mask.width, mask.height);
      if (context.getImageData(Math.floor(x), Math.floor(y), 1, 1).data[3] !== 0) {
        console.log(`Mask ${index} clicked`);
        setSelectedSegmentation(mask);
        setSelectedMaskIndex(index);
        setSelectedMaskRef(maskRefs.current[index]);
        break;
      }
    }
  };

  // Handle JSON file load
  useEffect(() => {
    if (jsonFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const data = JSON.parse(reader.result);
        getMasks(data)
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
          .catch(error => console.error(error))
          .finally(() => {
            setIsLoading(false);
            setIsModalOpen(false);
          });
      };
      reader.readAsText(jsonFile);
    }
  }, [selectedImage, jsonFile]);

  // Handle mask load
  useEffect(() => {
    masks.forEach((mask, index) => {
      if (mask.complete) {
        const randomColour = generateRandomColour();
        const { canvas, context } = createMaskCanvas(mask);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        updateImageData(imageData, randomColour);
        context.putImageData(imageData, 0, 0);
        const newImage = new Image();
        newImage.onload = () => {
          maskRefs.current[index].current.image(newImage);
          updatedImages.current[index] = newImage;
        };
        newImage.src = canvas.toDataURL();
      }
    });
  }, [masks]);

  return (
    selectedImage ? (
      <>
        <Modal isOpen={isModalOpen} style={{ content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', width: '400px' } }}>
          <div className="p-3 rounded text-center">
            {isLoading ? (
              <h2>Loading...</h2>
            ) : (
              <>
                <h2 className="mb-3">Select an option</h2>
                <button className="btn btn-primary mb-2" onClick={() => document.getElementById('json-upload').click()}>Upload COCO Segmentation file</button>
                <input type="file" id="json-upload" accept=".json" onChange={onJsonFileChange} style={{ display: 'none' }} />
                <button className="btn btn-secondary" onClick={() => { console.log("Chosen"); setIsModalOpen(false); }}>Generate segmentation</button>
              </>
            )}
          </div>
        </Modal>
        <Stage width={document.documentElement.clientWidth} height={document.documentElement.clientHeight} ref={stageRef}>
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
          </Layer>
        </Stage>
      </>
    ) : (
      <main className="d-flex justify-content-center align-items-center min-height">
        <StyledDropzone onDrop={onDrop} />
      </main>
    )
  );
}

export default Canvas;