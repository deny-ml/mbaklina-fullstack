// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import FormPengajuan from './components/Warga/FormPengajuan';
import LoginPage from './components/Admin/LoginPage';
import AdminLayout from './components/Admin/AdminLayout';
import DashboardPage from './components/Admin/DashboardPage';
import { useAuth } from './context/AuthContext';
import './App.css';

// Komponen untuk melindungi route admin
function PrivateRoute({ children }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/2025" />;
}

function App() {
    return (
        <Routes>
            {/* Rute Publik */}
            <Route path="/" element={<FormPengajuan />} />
            <Route path="/2025" element={<LoginPage />} />

            {/* Rute Admin yang Terproteksi */}
            <Route 
                path="/admin" 
                element={
                    <PrivateRoute>
                        <AdminLayout />
                    </PrivateRoute>
                }
            >
                {/* Redirect dari /admin ke /admin/dashboard */}
                <Route index element={<Navigate to="dashboard" />} /> 
                <Route path="dashboard" element={<DashboardPage />} />
            </Route>

            {/* Jika halaman tidak ditemukan, arahkan ke halaman utama */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

export default App;
