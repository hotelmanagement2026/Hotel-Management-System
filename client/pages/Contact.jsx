import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

const Contact = () => {
    const [formStatus, setFormStatus] = useState('idle');

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormStatus('sending');
        setTimeout(() => {
            setFormStatus('sent');
        }, 1500);
    };

    return (
        <div className="pt-24 min-h-screen bg-dark-900">
            <div className="container mx-auto px-6 py-12">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-serif text-stone-100 mb-16 text-center"
                >
                    Contact Us
                </motion.h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    {/* Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-2xl font-serif text-gold-400 mb-6">Get in Touch</h2>
                        <p className="text-stone-400 mb-8 leading-relaxed">
                            Our concierge team is available 24/7 to assist with your reservations, special requests, or any inquiries you may have.
                        </p>

                        <div className="space-y-6 text-stone-300">
                            <div>
                                <h4 className="uppercase text-xs tracking-widest text-stone-500 mb-1">Address</h4>
                                <p>123 Luxury Avenue, Paris, France 75001</p>
                            </div>
                            <div>
                                <h4 className="uppercase text-xs tracking-widest text-stone-500 mb-1">Phone</h4>
                                <p>+33 1 23 45 67 89</p>
                            </div>
                            <div>
                                <h4 className="uppercase text-xs tracking-widest text-stone-500 mb-1">Email</h4>
                                <p>concierge@lumiere.com</p>
                            </div>
                        </div>

                        <div className="mt-12 w-full h-64 bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-500">
                            <p>[Google Map Placeholder]</p>
                        </div>
                    </motion.div>

                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-dark-800 p-8 border border-stone-800"
                    >
                        {formStatus === 'sent' ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <h3 className="text-2xl font-serif text-gold-400 mb-4">Message Sent</h3>
                                <p className="text-stone-400">We will respond to your inquiry shortly.</p>
                                <button
                                    onClick={() => setFormStatus('idle')}
                                    className="mt-6 text-sm text-stone-500 hover:text-stone-300 underline"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-stone-400 text-xs uppercase tracking-widest mb-2">Name</label>
                                    <input type="text" required className="w-full bg-dark-900 border border-stone-700 text-stone-100 px-4 py-3 focus:border-gold-400 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-stone-400 text-xs uppercase tracking-widest mb-2">Email</label>
                                    <input type="email" required className="w-full bg-dark-900 border border-stone-700 text-stone-100 px-4 py-3 focus:border-gold-400 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-stone-400 text-xs uppercase tracking-widest mb-2">Subject</label>
                                    <select className="w-full bg-dark-900 border border-stone-700 text-stone-100 px-4 py-3 focus:border-gold-400 focus:outline-none">
                                        <option>General Inquiry</option>
                                        <option>Reservation Assistance</option>
                                        <option>Event Planning</option>
                                        <option>Press & Media</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-stone-400 text-xs uppercase tracking-widest mb-2">Message</label>
                                    <textarea required rows={5} className="w-full bg-dark-900 border border-stone-700 text-stone-100 px-4 py-3 focus:border-gold-400 focus:outline-none"></textarea>
                                </div>
                                <Button type="submit" className="w-full" disabled={formStatus === 'sending'}>
                                    {formStatus === 'sending' ? 'Sending...' : 'Send Message'}
                                </Button>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
