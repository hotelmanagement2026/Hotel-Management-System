import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { Navigate, Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const Dashboard = () => {
    const { user, logout, loading } = useAuth();
    const { bookings, cancelBooking } = useBooking();

    if (loading) {
        return (
            <div className="pt-24 min-h-screen bg-dark-900 flex items-center justify-center">
                <p className="text-stone-400">Loading your dashboard...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="pt-24 min-h-screen bg-dark-900">
            <div className="container mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-stone-800 pb-6">
                    <div>
                        <h1 className="text-4xl font-serif text-stone-100 mb-2">My Dashboard</h1>
                        <p className="text-stone-400">Welcome back, <span className="text-gold-400">{user.name}</span></p>
                    </div>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        {user.role === 'admin' && (
                            <Link to="/admin">
                                <Button className="px-6 py-2 text-xs bg-gold-400/10 text-gold-400 border border-gold-400/50 hover:bg-gold-400 hover:text-dark-900">Admin Panel</Button>
                            </Link>
                        )}
                        <Button variant="outline" onClick={logout} className="px-6 py-2 text-xs">Sign Out</Button>
                    </div>
                </div>

                {!user.isAccountVerified && (
                    <div className="mb-10 bg-dark-800 border border-gold-400/30 p-6">
                        <h3 className="text-xl font-serif text-stone-100 mb-2">Verify your email</h3>
                        <p className="text-stone-400">
                            Complete email verification to secure your account and access all features.
                        </p>
                        <Link to="/email-verify">
                            <Button variant="outline" className="mt-4">Verify Email</Button>
                        </Link>
                    </div>
                )}

                <h2 className="text-2xl font-serif text-stone-100 mb-8">My Bookings</h2>

                {bookings.length === 0 ? (
                    <div className="text-center py-20 bg-dark-800 border border-stone-800">
                        <p className="text-stone-500 mb-6">You have no active bookings.</p>
                        <Button onClick={() => window.location.hash = '#/rooms'}>Explore Rooms</Button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {bookings.map((booking) => (
                            <motion.div
                                key={booking.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-dark-800 border border-stone-800 p-6 flex flex-col md:flex-row justify-between items-center gap-6"
                            >
                                <div className="flex-grow">
                                    <div className="flex items-center gap-4 mb-2">
                                        <h3 className="text-xl font-serif text-gold-400">{booking.roomName}</h3>
                                        <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider border ${booking.status === 'confirmed' ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-stone-400">
                                        <p>Check-in: <span className="text-stone-200">{booking.checkIn}</span></p>
                                        <p>Check-out: <span className="text-stone-200">{booking.checkOut}</span></p>
                                        <p>Guests: <span className="text-stone-200">{booking.guests}</span></p>
                                        <p>Total: <span className="text-gold-400 font-bold">${booking.totalPrice}</span></p>
                                    </div>
                                    <p className="text-xs text-stone-600 mt-2">Booking ID: {booking.id}</p>
                                </div>

                                {booking.status !== 'cancelled' && (
                                    <Button
                                        variant="ghost"
                                        onClick={() => cancelBooking(booking.id)}
                                        className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                                    >
                                        Cancel Booking
                                    </Button>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
