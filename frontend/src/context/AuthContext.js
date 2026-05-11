// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api'; // Import api instance kita

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);

    useEffect(() => {
        const tokenFromStorage = localStorage.getItem('token');
        if (tokenFromStorage) {
            setToken(tokenFromStorage);
            setIsAuthenticated(true);
        }
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('/api/login', { username, password });
            const { token } = response.data;
            localStorage.setItem('token', token);
            setToken(token);
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            logout(); // Pastikan state bersih jika login gagal
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};