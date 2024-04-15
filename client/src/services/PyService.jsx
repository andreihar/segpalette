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

const getSegmentation = (imagePath) => {
  return axios.post(`${BASE_URL}/process_image`, { image_path: imagePath })
    .then(response => response.data)
    .catch(error => {
      console.error("Error processing image", error);
      throw error;
    });
};

export { getMasks, getSegmentation };