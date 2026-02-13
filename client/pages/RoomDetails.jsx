import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheck, FaStar } from 'react-icons/fa';
import api from '../utils/api';
import Button from '../components/ui/Button';
import { useBooking } from '../context/BookingContext';
import ReviewForm from '../components/ReviewForm';
import { useAuth } from '../context/AuthContext';

const RoomDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState('');
    const [reviews, setReviews] = useState([]);
    const [canReview, setCanReview] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [reviewMessage, setReviewMessage] = useState('');
    const { setBookingDraft } = useBooking();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchRoom();
        fetchReviews();
        if (isAuthenticated) {
            checkEligibility();
        }
    }, [id, isAuthenticated]);

    const fetchRoom = async () => {
        try {
            const { data } = await api.get(`/rooms/${id}`);
            if (data.success) {
                setRoom(data.data);
                if (data.data.images && data.data.images.length > 0) {
                    setActiveImage(data.data.images[0]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch room:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const { data } = await api.get(`/reviews/${id}`);
            if (data.success) {
                setReviews(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        }
    };

    const checkEligibility = async () => {
        try {
            const { data } = await api.get(`/reviews/eligibility/${id}`);
            if (data.success) {
                setCanReview(data.canReview || false);
                setHasReviewed(data.hasReviewed || false);
                setReviewMessage(data.message || '');
            }
        } catch (error) {
            console.error('Failed to check eligibility:', error);
            setCanReview(false);
        }
    };

    if (loading) {
        return (
            <div className="pt-32 min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="text-stone-400 text-lg">Loading room details...</div>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="pt-32 min-h-screen bg-dark-900 flex flex-col items-center justify-center">
                <div className="text-stone-100 text-2xl mb-4">Room not found or unavailable</div>
                <Button onClick={() => navigate('/rooms')}>Back to Rooms</Button>
            </div>
        );
    }

    const handleBookNow = () => {
        setBookingDraft({
            roomId: room._id,
            roomName: room.name,
            totalPrice: room.price
        });
        navigate('/booking');
    };

    return (
        <div className="pt-20 min-h-screen bg-dark-900">
            {/* Gallery */}
            <div className="container mx-auto px-6 py-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[500px]"
                >
                    <div className="lg:col-span-2 h-full">
                        <img
                            src={activeImage || 'https://via.placeholder.com/800x600?text=No+Image'}
                            alt={room.name}
                            className="w-full h-full object-cover rounded-sm shadow-xl"
                        />
                    </div>
                    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-2 custom-scrollbar">
                        {room.images && room.images.length > 0 ? (
                            room.images.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt={`View ${idx + 1}`}
                                    onClick={() => setActiveImage(img)}
                                    className={`w-full h-32 object-cover cursor-pointer transition-all duration-300 rounded-sm ${activeImage === img
                                        ? 'ring-2 ring-gold-400 opacity-100'
                                        : 'opacity-60 hover:opacity-100'
                                        }`}
                                />
                            ))
                        ) : (
                            <div className="text-stone-500 text-sm text-center">No additional images</div>
                        )}
                    </div>
                </motion.div>
            </div>

            <div className="container mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Info */}
                    <div className="lg:w-2/3">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h1 className="text-4xl md:text-5xl font-serif text-stone-100 mb-6">{room.name}</h1>
                            <p className="text-stone-400 text-lg leading-relaxed mb-8">
                                {room.description || 'Experience luxury and comfort in this beautifully appointed room.'}
                            </p>

                            <h3 className="text-2xl font-serif text-stone-100 mb-6">Amenities</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 mb-12">
                                {room.amenities && room.amenities.length > 0 ? (
                                    room.amenities.map((amenity, idx) => (
                                        <div key={idx} className="flex items-center text-stone-400 gap-3">
                                            <div className="text-gold-400"><FaCheck size={12} /></div>
                                            <span>{amenity}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-stone-500 text-sm">Premium amenities included</div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Booking Card */}
                    <div className="lg:w-1/3">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-dark-800 p-8 border border-stone-800 sticky top-32"
                        >
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <p className="text-sm text-stone-500">Starting from</p>
                                    <p className="text-3xl font-serif text-gold-400">₹{room.price.toLocaleString()}</p>
                                </div>
                                <span className="text-stone-500 text-sm mb-1">/ Night</span>
                            </div>

                            <div className="space-y-4 mb-8 text-sm text-stone-400">
                                <div className="flex justify-between border-b border-stone-700 pb-2">
                                    <span>Capacity</span>
                                    <span className="text-stone-200">
                                        {room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b border-stone-700 pb-2">
                                    <span>Check-in</span>
                                    <span className="text-stone-200">3:00 PM</span>
                                </div>
                                <div className="flex justify-between border-b border-stone-700 pb-2">
                                    <span>Check-out</span>
                                    <span className="text-stone-200">11:00 AM</span>
                                </div>
                            </div>

                            <Button onClick={handleBookNow} className="w-full text-center justify-center">
                                Book This Room
                            </Button>
                            <p className="text-center text-xs text-stone-500 mt-4">
                                No credit card charged until check-in.
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="container mx-auto px-6 py-12">
                    {/* Review Form - Only for eligible users (checked-out bookings) */}
                    {isAuthenticated && canReview && (
                        <div className="mb-12">
                            <ReviewForm roomId={id} onReviewSubmitted={() => {
                                fetchReviews();
                                checkEligibility();
                            }} />
                        </div>
                    )}

                    {/* Messages for different states */}
                    {isAuthenticated && !canReview && hasReviewed && (
                        <div className="mb-12 bg-dark-800 border border-gold-400/30 p-6 rounded-lg">
                            <p className="text-stone-300 text-center">
                                ✓ You have already reviewed this room. Your review is {reviewMessage.includes('pending') ? 'pending approval' : 'submitted'}.
                            </p>
                        </div>
                    )}

                    {/* Display Reviews */}
                    <div className="mt-12">
                        <h3 className="text-3xl font-serif text-stone-100 mb-8">Guest Reviews</h3>

                        {reviews.length === 0 ? (
                            <div className="bg-dark-800 border border-stone-800 p-8 text-center">
                                <p className="text-stone-400">No reviews yet. Be the first to review this room!</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {reviews.map((review) => (
                                    <motion.div
                                        key={review._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-dark-800 border border-stone-800 p-6"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h4 className="text-stone-100 font-semibold text-lg">
                                                    {review.user?.name || 'Guest'}
                                                </h4>
                                                <div className="flex gap-1 mt-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <FaStar
                                                            key={star}
                                                            className={star <= review.rating ? 'text-yellow-400' : 'text-gray-600'}
                                                            size={16}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="text-stone-500 text-sm">
                                                {new Date(review.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-stone-400 leading-relaxed">{review.comment}</p>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomDetails;
