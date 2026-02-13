import { useState, useEffect } from 'react';
import { FaStar, FaTimes } from 'react-icons/fa';
import api from '../utils/api';

const ReviewModal = ({ isOpen, onClose, roomId, roomName, bookingId, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setRating(0);
            setComment('');
            setMessage({ type: '', text: '' });
        }
    }, [isOpen]);

    // Close on ESC key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            setMessage({ type: 'error', text: 'Please select a rating.' });
            return;
        }

        if (comment.trim().length < 10) {
            setMessage({ type: 'error', text: 'Comment must be at least 10 characters.' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await api.post('/reviews', { roomId, rating, comment });

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Review submitted for admin approval!' });
                setTimeout(() => {
                    if (onReviewSubmitted) onReviewSubmitted();
                    onClose();
                }, 1500);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to submit review.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-dark-800 border border-stone-800 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-stone-800">
                    <div>
                        <h3 className="text-2xl font-serif text-stone-100">Write a Review</h3>
                        <p className="text-sm text-stone-400 mt-1">{roomName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-stone-100 transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Message */}
                    {message.text && (
                        <div className={`mb-6 p-4 border ${message.type === 'success'
                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    {/* Star Rating */}
                    <div className="mb-6">
                        <label className="block text-stone-300 font-semibold mb-3">
                            Rating
                        </label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    className="text-4xl transition-all duration-200 hover:scale-110"
                                >
                                    <FaStar
                                        className={
                                            star <= (hover || rating)
                                                ? 'text-gold-400'
                                                : 'text-stone-700'
                                        }
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-sm text-stone-400 mt-2">
                                {rating === 1 && 'Poor'}
                                {rating === 2 && 'Fair'}
                                {rating === 3 && 'Good'}
                                {rating === 4 && 'Very Good'}
                                {rating === 5 && 'Excellent'}
                            </p>
                        )}
                    </div>

                    {/* Comment */}
                    <div className="mb-6">
                        <label className="block text-stone-300 font-semibold mb-3">
                            Your Review
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience with this room..."
                            rows="5"
                            className="w-full px-4 py-3 bg-dark-900 border border-stone-700 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-gold-400 transition-colors resize-none"
                            required
                        />
                        <p className="text-xs text-stone-500 mt-2">
                            Minimum 10 characters ({comment.length}/10)
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gold-400 text-dark-900 py-3 font-semibold hover:bg-gold-500 transition-colors disabled:bg-stone-700 disabled:text-stone-500 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Submitting...' : 'Submit Review'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border border-stone-700 text-stone-300 hover:bg-stone-800 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
