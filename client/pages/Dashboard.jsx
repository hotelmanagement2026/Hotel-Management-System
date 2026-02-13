import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { Navigate, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import ReviewModal from '../components/ReviewModal';
import api from '../utils/api';

const Dashboard = () => {
    const { user, logout, loading } = useAuth();
    const { bookings, cancelBooking } = useBooking();
    const [reviewModal, setReviewModal] = useState({ isOpen: false, booking: null });
    const [reviewStatuses, setReviewStatuses] = useState({});

    // Check review status for all checked-out bookings
    useEffect(() => {
        const checkReviewStatuses = async () => {
            const checkedOutBookings = bookings.filter(b => b.bookingStatus === 'checked_out');

            for (const booking of checkedOutBookings) {
                try {
                    const { data } = await api.get(`/reviews/eligibility/${booking.roomId}`);

                    setReviewStatuses(prev => ({
                        ...prev,
                        [booking.bookingId]: {
                            canReview: data.canReview || false,
                            hasReviewed: data.hasReviewed || false,
                            reviewStatus: data.reviewStatus || null
                        }
                    }));
                } catch (error) {
                    console.error('Failed to check review status:', error);
                }
            }
        };

        if (bookings.length > 0) {
            checkReviewStatuses();
        }
    }, [bookings]);

    const openReviewModal = (booking) => {
        setReviewModal({ isOpen: true, booking });
    };

    const closeReviewModal = () => {
        setReviewModal({ isOpen: false, booking: null });
    };

    const handleReviewSubmitted = () => {
        // Refresh review statuses
        if (reviewModal.booking) {
            setReviewStatuses(prev => ({
                ...prev,
                [reviewModal.booking.bookingId]: {
                    canReview: false,
                    hasReviewed: true,
                    reviewStatus: 'pending'
                }
            }));
        }
    };

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
                        {bookings.map((booking) => {
                            const reviewStatus = reviewStatuses[booking.bookingId];
                            const isCheckedOut = booking.bookingStatus === 'checked_out';

                            return (
                                <motion.div
                                    key={booking._id || booking.bookingId}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-dark-800 border border-stone-800 p-6 flex flex-col md:flex-row justify-between items-center gap-6"
                                >
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-4 mb-2">
                                            <h3 className="text-xl font-serif text-gold-400">{booking.roomName}</h3>
                                            <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider border ${booking.bookingStatus === 'confirmed' || booking.status === 'success'
                                                ? 'border-green-500 text-green-500'
                                                : booking.bookingStatus === 'checked_out'
                                                    ? 'border-blue-500 text-blue-500'
                                                    : 'border-red-500 text-red-500'
                                                }`}>
                                                {booking.bookingStatus || booking.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-stone-400">
                                            <p>Check-in: <span className="text-stone-200">{booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : 'N/A'}</span></p>
                                            <p>Check-out: <span className="text-stone-200">{booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : 'N/A'}</span></p>
                                            <p>Total: <span className="text-gold-400 font-bold">₹{booking.amount || 0}</span></p>
                                        </div>
                                        <p className="text-xs text-stone-600 mt-2">Booking ID: {booking.bookingId}</p>
                                    </div>

                                    <div className="flex gap-3">
                                        {/* Review Button for Checked-out Bookings */}
                                        {isCheckedOut && (
                                            <>
                                                {reviewStatus?.hasReviewed ? (
                                                    <div className="px-4 py-2 border border-stone-700 text-stone-400 text-sm">
                                                        {reviewStatus.reviewStatus === 'pending' ? '⏳ Review Pending' : '✓ Reviewed'}
                                                    </div>
                                                ) : (
                                                    <Button
                                                        onClick={() => openReviewModal(booking)}
                                                        className="px-4 py-2 text-sm bg-gold-400/10 text-gold-400 border border-gold-400/50 hover:bg-gold-400 hover:text-dark-900"
                                                    >
                                                        ⭐ Write Review
                                                    </Button>
                                                )}
                                            </>
                                        )}

                                        {/* Cancel Button for Active Bookings */}
                                        {booking.bookingStatus !== 'checked_out' && booking.status !== 'cancelled' && (
                                            <Button
                                                variant="ghost"
                                                onClick={() => cancelBooking(booking.bookingId)}
                                                className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                                            >
                                                Cancel Booking
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {reviewModal.isOpen && reviewModal.booking && (
                <ReviewModal
                    isOpen={reviewModal.isOpen}
                    onClose={closeReviewModal}
                    roomId={reviewModal.booking.roomId}
                    roomName={reviewModal.booking.roomName}
                    bookingId={reviewModal.booking.bookingId}
                    onReviewSubmitted={handleReviewSubmitted}
                />
            )}
        </div>
    );
};

export default Dashboard;
