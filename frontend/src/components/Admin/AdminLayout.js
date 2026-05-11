// src/components/Admin/AdminLayout.js (Versi Light Theme)
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChartBarIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/solid';

function AdminLayout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/2025');
    };

    // Style baru untuk NavLink pada light theme
    const navLinkClasses = ({ isActive }) =>
        `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
        isActive 
            ? 'bg-blue-100 text-blue-700' 
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`;

    return (
        <div className="flex h-screen bg-slate-100 font-sans">
            {/* === SIDEBAR (VERSI LIGHT) === */}
            <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col p-4">
                
                {/* Header Sidebar dengan Logo Berwarna */}
                <div className="flex items-center gap-3 px-2 mb-8">
                    <img 
                        src="/assets/images/logo-dishub.png" 
                        alt="Logo Dishub" 
                        className="h-10" // <-- Class filter dihapus, logo tampil normal
                    />
                    <span className="text-lg font-semibold text-slate-800">Admin Panel</span>
                </div>

                {/* Navigasi Utama */}
                <nav className="flex-grow">
                    <ul>
                        <li>
                            <NavLink to="/admin/dashboard" className={navLinkClasses}>
                                <ChartBarIcon className="w-5 h-5 mr-3" />
                                Dashboard
                            </NavLink>
                        </li>
                        {/* Tambahkan link navigasi lain di sini jika ada */}
                    </ul>
                </nav>

                {/* Tombol Logout */}
                <div className="mt-auto">
                    <button 
                        onClick={handleLogout} 
                        className="flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg text-slate-600 hover:bg-rose-500 hover:text-white transition-colors duration-200"
                    >
                        <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* === KONTEN UTAMA === */}
            <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                <Outlet />
            </main>
        </div>
    );
}

export default AdminLayout;
