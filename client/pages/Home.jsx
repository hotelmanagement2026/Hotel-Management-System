import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaConciergeBell, FaSwimmingPool, FaWineGlassAlt, FaAward } from 'react-icons/fa';
import Button from '../components/ui/Button';
import roomBackground from '../olexandr-ignatov-w72a24brINI-unsplash.jpg';

const Home = () => {
    return (
        <div className="w-full overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-fixed opacity-60 scale-105"
                    style={{ backgroundImage: `url(${roomBackground})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-dark-900/40 via-dark-900/20 to-dark-900 z-10" />

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative z-20 text-center px-4 max-w-4xl"
                >
                    <p className="text-gold-400 uppercase tracking-[0.3em] text-sm md:text-base mb-6">
                        The Art of Living
                    </p>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-stone-100 mb-8 leading-tight">
                        Redefining <br /> <span className="italic text-gold-400">Luxury</span>
                    </h1>
                    <p className="text-stone-300 text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto leading-relaxed">
                        Escape to a world where elegance creates the atmosphere, and service creates the feeling.
                    </p>
                    <Link to="/rooms">
                        <Button className="text-lg px-10 py-4">
                            Book Your Stay
                        </Button>
                    </Link>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-dark-900 relative">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
                        {[
                            { icon: FaConciergeBell, title: "24/7 Concierge", desc: "Service at your fingertips" },
                            { icon: FaSwimmingPool, title: "Infinity Pools", desc: "Swim above the horizon" },
                            { icon: FaWineGlassAlt, title: "Fine Dining", desc: "Culinary masterpieces" },
                            { icon: FaAward, title: "Award Winning", desc: "Recognized excellence" },
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-6 border border-transparent hover:border-stone-800 transition-colors duration-300 rounded-lg group"
                            >
                                <div className="w-16 h-16 mx-auto mb-6 bg-dark-800 rounded-full flex items-center justify-center text-gold-400 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                                    <feature.icon size={24} />
                                </div>
                                <h3 className="text-xl font-serif text-stone-100 mb-2">{feature.title}</h3>
                                <p className="text-stone-500 text-sm">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Intro Section */}
            <section className="py-24 bg-dark-800">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="md:w-1/2"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070&auto=format&fit=crop"
                                alt="Luxury Lobby"
                                className="rounded-sm shadow-2xl"
                            />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="md:w-1/2 space-y-6"
                        >
                            <h2 className="text-4xl font-serif text-stone-100">A Sanctuary in the City</h2>
                            <p className="text-stone-400 leading-relaxed">
                                Located in the heart of the metropolis yet tucked away from its bustle, Lumière offers a tranquil retreat.
                                Our rooms are designed to be personal sanctuaries, blending contemporary aesthetics with timeless comfort.
                            </p>
                            <p className="text-stone-400 leading-relaxed">
                                Whether you are here for business or leisure, our dedicated team ensures your stay is nothing short of perfection.
                            </p>
                            <Link to="/about" className="inline-block border-b border-gold-400 text-gold-400 pb-1 mt-4 hover:text-white hover:border-white transition-colors">
                                Read Our Story
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-dark-900 border-t border-stone-900">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-serif text-stone-100 mb-16">Guest Stories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: "Sarah Jenkins", role: "Business Traveler", text: "The attention to detail is simply unmatched. The best hotel experience of my life." },
                            { name: "Michael Wong", role: "Honeymooner", text: "Magical. The ocean suite was breathtaking and the staff made us feel like royalty." },
                            { name: "Elena Rossi", role: "Fashion Designer", text: "An inspiring space. The aesthetics are impeccable, from the lobby to the linens." }
                        ].map((t, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="bg-dark-800 p-8 shadow-lg relative"
                            >
                                <div className="text-gold-400 text-4xl font-serif absolute top-4 left-6 opacity-30">"</div>
                                <p className="text-stone-300 italic mb-6 relative z-10 pt-4">{t.text}</p>
                                <h4 className="font-bold text-stone-100">{t.name}</h4>
                                <span className="text-xs text-stone-500 uppercase tracking-wide">{t.role}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
