import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import { FaBars, FaUserCircle } from 'react-icons/fa';

const AdminLayout = () => {
    const { user, loading, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="text-stone-400">Loading...</div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return <Navigate to="/" />;
    }

    return (
        <div className="min-h-screen bg-dark-900 flex">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top Header */}
                <header className="bg-dark-800 border-b border-stone-800 sticky top-0 z-30">
                    <div className="flex items-center justify-between px-6 py-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gold-400 hover:text-gold-500"
                        >
                            <FaBars size={24} />
                        </button>

                        {/* Logo/Title for mobile */}
                        <div className="lg:hidden text-xl font-serif text-gold-400">
                            LUMIÈRE
                        </div>

                        {/* Spacer for desktop */}
                        <div className="hidden lg:block"></div>

                        {/* User Info */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-stone-300">
                                <FaUserCircle size={20} className="text-gold-400" />
                                <span className="hidden sm:inline text-sm">{user.name}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="px-4 py-2 text-xs uppercase tracking-widest text-stone-400 hover:text-white border border-stone-700 hover:border-stone-500 rounded transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
