import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChartLine, FaUsers, FaCalendarAlt, FaCreditCard, FaChartBar, FaDoorOpen, FaTimes, FaStar } from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', path: '/admin', icon: FaChartLine, exact: true },
        { name: 'User Management', path: '/admin/users', icon: FaUsers },
        { name: 'Room Management', path: '/admin/rooms', icon: FaDoorOpen },
        { name: 'Booking Management', path: '/admin/bookings', icon: FaCalendarAlt },
        { name: 'Payment Management', path: '/admin/payments', icon: FaCreditCard },
        { name: 'Reviews', path: '/admin/reviews', icon: FaStar },
        { name: 'Reports', path: '/admin/reports', icon: FaChartBar },
    ];

    const isActive = (item) => {
        if (item.exact) {
            return location.pathname === item.path;
        }
        return location.pathname.startsWith(item.path);
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 h-full bg-dark-800 border-r border-stone-800 z-50
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static
                w-64
                flex flex-col
            `}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-stone-800 flex-shrink-0">
                    <h2 className="text-xl font-serif text-gold-400">Admin Panel</h2>
                    <button
                        onClick={onClose}
                        className="lg:hidden text-stone-400 hover:text-white"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Navigation - Scrollable */}
                <nav className="p-4 flex-1 overflow-y-auto">
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item);

                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        onClick={onClose}
                                        className={`
                                            flex items-center gap-3 px-4 py-3 rounded-lg
                                            transition-all duration-200
                                            ${active
                                                ? 'bg-gold-400 text-dark-900 font-medium'
                                                : 'text-stone-300 hover:bg-dark-700 hover:text-white'
                                            }
                                        `}
                                    >
                                        <Icon size={18} />
                                        <span className="text-sm">{item.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Footer - Fixed at bottom */}
                <div className="p-4 border-t border-stone-800 flex-shrink-0">
                    <Link
                        to="/"
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-stone-400 hover:text-white transition-colors"
                    >
                        ← Back to Website
                    </Link>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
