// src/components/Admin/LoginPage.js
import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const success = await login(username, password);
        if (success) {
            navigate('/admin/dashboard');
        } else {
            setError('Username atau password yang Anda masukkan salah.');
        }
        setIsLoading(false);
    };

    if (isAuthenticated) {
        return <Navigate to="/admin/dashboard" />;
    }

    return (
        <div className="bg-slate-100 min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <div className="text-center mb-8">
                        <img src="/assets/images/logo-dishub.png" alt="Logo Dishub" className="h-20 mx-auto" />
                        <h2 className="mt-4 text-2xl font-bold text-slate-800">Admin Panel Login</h2>
                        <p className="text-slate-500">Silakan masuk untuk mengelola pengajuan.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-700">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-slate-700">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        
                        {error && (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700 text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300">
                                {isLoading ? 'Memverifikasi...' : 'Masuk'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-6 text-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600">
                        <ArrowLeftIcon className="w-4 h-4" />
                        Kembali ke Halaman Formulir
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;