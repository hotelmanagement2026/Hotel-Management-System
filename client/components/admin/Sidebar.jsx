import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChartLine, FaUsers, FaCalendarAlt, FaCreditCard, FaChartBar, FaDoorOpen, FaTimes, FaStar, FaTags, FaPercentage, FaFileInvoice, FaUndo } from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();

    const menuGroups = [
        {
            title: null, // Main
            items: [
                { name: 'Dashboard', path: '/admin', icon: FaChartLine, exact: true }
            ]
        },
        {
            title: 'Management',
            items: [
                { name: 'Bookings', path: '/admin/bookings', icon: FaCalendarAlt },
                { name: 'Rooms', path: '/admin/rooms', icon: FaDoorOpen },
                { name: 'Users', path: '/admin/users', icon: FaUsers },
            ]
        },
        {
            title: 'Finance',
            items: [
                { name: 'Payments', path: '/admin/payments', icon: FaCreditCard },
                { name: 'Invoices', path: '/admin/invoices', icon: FaFileInvoice },
                { name: 'Refunds', path: '/admin/refunds', icon: FaUndo },
            ]
        },
        {
            title: 'Marketing',
            items: [
                { name: 'Promo Codes', path: '/admin/promocodes', icon: FaTags },
                { name: 'Discounts', path: '/admin/discounts', icon: FaPercentage },
            ]
        },
        {
            title: 'Insights',
            items: [
                { name: 'Reviews', path: '/admin/reviews', icon: FaStar },
                { name: 'Reports', path: '/admin/reports', icon: FaChartBar },
            ]
        }
    ];

    const isActive = (path, exact) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
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
                <nav className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="space-y-6">
                        {menuGroups.map((group, groupIndex) => (
                            <div key={groupIndex}>
                                {group.title && (
                                    <h3 className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-2 px-4">
                                        {group.title}
                                    </h3>
                                )}
                                <ul className="space-y-1">
                                    {group.items.map((item) => {
                                        const Icon = item.icon;
                                        const active = isActive(item.path, item.exact);

                                        return (
                                            <li key={item.path}>
                                                <Link
                                                    to={item.path}
                                                    onClick={onClose}
                                                    className={`
                                                        flex items-center gap-3 px-4 py-2.5 rounded-lg
                                                        transition-all duration-200
                                                        ${active
                                                            ? 'bg-gold-500 text-dark-900 font-medium'
                                                            : 'text-stone-300 hover:bg-dark-700 hover:text-white'
                                                        }
                                                    `}
                                                >
                                                    <Icon size={16} />
                                                    <span className="text-sm">{item.name}</span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
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
