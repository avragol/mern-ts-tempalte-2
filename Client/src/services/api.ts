import axios from "axios";

const getBaseURL = () => {
    if (import.meta.env.VITE_API_URL) {
        // Strip trailing /api if already present, then always append it
        const url = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
        return `${url}/api`;
    }
    // Dev mode: use relative URL so Vite proxy handles /api/*
    return '/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
    timeout: 10000,
});

export default api;