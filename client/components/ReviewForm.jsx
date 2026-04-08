import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import api from '../utils/api';

const ReviewForm = ({ roomId, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

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
                setMessage({ type: 'success', text: 'Review submitted for admin approval.' });
                setRating(0);
                setComment('');
                if (onReviewSubmitted) onReviewSubmitted();
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to submit review.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-dark-800 border border-stone-800 p-6 mb-8">
            <h3 className="text-2xl font-serif text-stone-100 mb-4">Write a Review</h3>

            {message.text && (
                <div className={`mb-4 p-3 border ${message.type === 'success'
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Star Rating */}
                <div className="mb-4">
                    <label className="block text-stone-300 font-semibold mb-2">
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
                                className="text-3xl transition-colors"
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
                </div>

                {/* Comment */}
                <div className="mb-4">
                    <label className="block text-stone-300 font-semibold mb-2">
                        Your Review
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience with this room..."
                        rows="4"
                        className="w-full px-4 py-2 bg-dark-900 border border-stone-700 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-gold-400 transition-colors resize-none"
                        required
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gold-400 text-dark-900 py-3 font-semibold hover:bg-gold-500 transition-colors disabled:bg-stone-700 disabled:text-stone-500 disabled:cursor-not-allowed"
                >
                    {loading ? 'Submitting...' : 'Submit Review'}
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;
