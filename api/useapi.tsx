import axios from 'axios';

const api = axios.create({
  baseURL: 'https://studium.wilsonfelix.com.br/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


export default api;