import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
    return (
        <div className="pt-24 min-h-screen bg-dark-900">
            {/* Header */}
            <div className="container mx-auto px-6 py-12 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-serif text-stone-100 mb-6"
                >
                    Our Heritage
                </motion.h1>
                <p className="text-stone-400 max-w-2xl mx-auto text-lg">
                    Established in 1924, Lumière has set the standard for luxury hospitality for a century.
                </p>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 py-12 space-y-24">
                {/* Section 1 */}
                <div className="flex flex-col md:flex-row items-center gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="md:w-1/2"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop"
                            alt="Hotel History"
                            className="rounded-sm shadow-xl border border-stone-800"
                        />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="md:w-1/2"
                    >
                        <h2 className="text-3xl font-serif text-gold-400 mb-6">A Legacy of Excellence</h2>
                        <p className="text-stone-400 leading-relaxed mb-6">
                            What began as a boutique retreat for the European aristocracy has evolved into a global icon of refined living.
                            Our walls echo with the laughter of dignitaries, artists, and visionaries who have found solace in our halls.
                        </p>
                        <p className="text-stone-400 leading-relaxed">
                            We believe that true luxury lies not just in opulence, but in the intuitive anticipation of your every need.
                        </p>
                    </motion.div>
                </div>

                {/* Section 2 */}
                <div className="flex flex-col md:flex-row-reverse items-center gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="md:w-1/2"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1974&auto=format&fit=crop"
                            alt="Chef"
                            className="rounded-sm shadow-xl border border-stone-800"
                        />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="md:w-1/2"
                    >
                        <h2 className="text-3xl font-serif text-gold-400 mb-6">Culinary Mastery</h2>
                        <p className="text-stone-400 leading-relaxed mb-6">
                            Led by Michelin-starred Executive Chef Laurent Dubois, our dining experiences are a journey through the senses.
                            We source the finest local ingredients to create dishes that are as visually stunning as they are delicious.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default About;
