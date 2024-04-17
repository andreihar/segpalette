import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

const getMasks = (jsonData) => {
  return axios.post(`${BASE_URL}/masks`, jsonData)
    .then(response => response.data)
    .catch(error => {
      console.error("Error fetching server message", error);
      throw error;
    });
};

const getSegmentation = (dataUrl) => {
  const byteString = atob(dataUrl.split(',')[1]);
  const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([uint8Array], {type: mimeString});

  const formData = new FormData();
  formData.append('image', blob);
  
  return axios.post(`${BASE_URL}/segment`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  .then(response => response.data)
  .catch(error => {
    console.error("Error processing image", error);
    throw error;
  });
};

export { getMasks, getSegmentation };