// src/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://mbaklina-fullstack.vercel.app',
});

// Ini adalah bagian penting: Interceptor
// Setiap request yang dikirim menggunakan 'api' akan dicek terlebih dahulu
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;