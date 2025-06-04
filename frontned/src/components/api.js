// src/api.js
import axios from "axios";

const ENDPOINT = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: ENDPOINT,
});

export default api;
