import axios from 'axios';

// Use Vite's env access (import.meta.env) which ESLint recognizes in this setup.
// Keep the same fallback to localhost for local dev.
const baseURL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:5000/api';

const API = axios.create({
  baseURL,
  timeout: 10000
});

export default API;
