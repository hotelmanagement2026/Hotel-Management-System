import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Rooms', path: '/rooms' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' },
    ];

    if (user) {
        navLinks.push({ name: 'Dashboard', path: '/dashboard' });
        if (user.role === 'admin') {
            navLinks.push({ name: 'Admin Panel', path: '/admin' });
            navLinks.push({ name: 'Reports', path: '/admin/reports' });
        }
    }

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6 }}
                className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-dark-900/95 backdrop-blur-md shadow-lg py-4' : 'bg-transparent py-6'
                    }`}
            >
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-serif font-bold text-gold-400 tracking-wider">
                        LUMIÈRE
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm tracking-widest uppercase transition-colors duration-300 ${location.pathname === link.path ? 'text-gold-400' : 'text-stone-300 hover:text-white'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}



                        {user ? (
                            <div className="flex items-center space-x-4 ml-6">
                                <Link to="/dashboard" className="text-stone-300 hover:text-gold-400 flex items-center gap-2">
                                    <FaUserCircle size={20} />
                                    <span>{user.name.split(' ')[0]}</span>
                                </Link>
                                <button onClick={logout} className="text-xs uppercase tracking-widest text-stone-500 hover:text-stone-300">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="px-6 py-2 border border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-dark-900 transition-all duration-300 text-sm uppercase tracking-widest">
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden text-gold-400"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: "tween" }}
                        className="fixed inset-0 z-40 bg-dark-900 flex flex-col justify-center items-center space-y-8 md:hidden"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="text-2xl font-serif text-stone-300 hover:text-gold-400"
                            >
                                {link.name}
                            </Link>
                        ))}

                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-2xl font-serif text-gold-400">
                                    My Dashboard
                                </Link>
                                <button onClick={logout} className="text-lg text-stone-500">Logout</button>
                            </>
                        ) : (
                            <Link to="/login" className="text-2xl font-serif text-gold-400">
                                Login
                            </Link>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
