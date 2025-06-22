import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7190/api', 
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