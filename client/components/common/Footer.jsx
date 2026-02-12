import React from 'react';
import { FaInstagram, FaFacebookF, FaTwitter } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-dark-800 border-t border-stone-800 pt-16 pb-8">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="md:col-span-1">
                        <h2 className="text-2xl font-serif font-bold text-gold-400 mb-6">LUMIÈRE</h2>
                        <p className="text-stone-400 text-sm leading-relaxed mb-6">
                            Experience the pinnacle of luxury and hospitality. Where timeless elegance meets modern comfort.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center text-stone-400 hover:border-gold-400 hover:text-gold-400 transition-colors">
                                <FaInstagram size={16} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center text-stone-400 hover:border-gold-400 hover:text-gold-400 transition-colors">
                                <FaFacebookF size={16} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center text-stone-400 hover:border-gold-400 hover:text-gold-400 transition-colors">
                                <FaTwitter size={16} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-serif text-stone-100 mb-6">Explore</h3>
                        <ul className="space-y-4 text-sm text-stone-400">
                            <li><a href="#" className="hover:text-gold-400 transition-colors">The Hotel</a></li>
                            <li><a href="#" className="hover:text-gold-400 transition-colors">Rooms & Suites</a></li>
                            <li><a href="#" className="hover:text-gold-400 transition-colors">Dining</a></li>
                            <li><a href="#" className="hover:text-gold-400 transition-colors">Spa & Wellness</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-serif text-stone-100 mb-6">Contact</h3>
                        <ul className="space-y-4 text-sm text-stone-400">
                            <li>123 Luxury Avenue</li>
                            <li>Paris, France 75001</li>
                            <li>+33 1 23 45 67 89</li>
                            <li>concierge@lumiere.com</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-serif text-stone-100 mb-6">Newsletter</h3>
                        <p className="text-stone-400 text-sm mb-4">Subscribe for exclusive offers.</p>
                        <form className="flex flex-col space-y-2">
                            <input
                                type="email"
                                placeholder="Your email address"
                                className="bg-transparent border-b border-stone-700 py-2 text-stone-100 focus:outline-none focus:border-gold-400 placeholder-stone-600 text-sm"
                            />
                            <button className="text-left text-gold-400 text-sm hover:text-gold-500 font-bold uppercase tracking-widest mt-2">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-stone-500">
                    <p>&copy; 2024 Lumière Hotels. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-stone-300">Privacy Policy</a>
                        <a href="#" className="hover:text-stone-300">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
