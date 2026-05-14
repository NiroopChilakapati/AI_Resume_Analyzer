import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ai-resume-analyzer-deej.onrender.com'
});

export default api;