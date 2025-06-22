import axios from 'axios';

const PRODUCTION_API_BASE_URL = "https://forkliftbackend-d5b4hccwbmcweua2.canadacentral-01.azurewebsites.net/api";

const apiClient = axios.create({
  baseURL: PRODUCTION_API_BASE_URL, 
  withCredentials: true, 
});


apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response || error.message);

    return Promise.reject(error);
  }
);

export default apiClient;