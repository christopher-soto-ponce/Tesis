// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://prometeodigital.com:3003/api", // para local http:localhost:pouertoapi/api
  //baseURL: 'http://localhost:3003/api'
});

export default api;
