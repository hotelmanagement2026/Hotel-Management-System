import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FaStar, FaCheck, FaTimes } from 'react-icons/fa';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchPendingReviews();
    }, []);

    const fetchPendingReviews = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' }); // Clear any previous messages
        try {
            const response = await api.get('/admin/reviews/pending');

            if (response.data.success) {
                setReviews(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            setMessage({ type: 'error', text: 'Failed to load reviews.' });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (reviewId) => {
        try {
            const response = await api.put(`/admin/reviews/approve/${reviewId}`);

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Review approved successfully.' });
                fetchPendingReviews(); // Refresh list
            }
        } catch (error) {
            console.error('Failed to approve review:', error);
            setMessage({ type: 'error', text: 'Failed to approve review.' });
        }
    };

    const handleReject = async (reviewId) => {
        try {
            const response = await api.put(`/admin/reviews/reject/${reviewId}`);

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Review rejected successfully.' });
                fetchPendingReviews(); // Refresh list
            }
        } catch (error) {
            console.error('Failed to reject review:', error);
            setMessage({ type: 'error', text: 'Failed to reject review.' });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-600 text-lg">Loading reviews...</div>
            </div>
        );
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">Pending</span>;
            case 'approved':
                return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-500/10 text-green-500 border border-green-500/20">Approved</span>;
            case 'rejected':
                return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-500/10 text-red-500 border border-red-500/20">Rejected</span>;
            default:
                return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-stone-500/10 text-stone-500 border border-stone-500/20">{status}</span>;
        }
    };

    return (
        <div className="p-8 bg-dark-900 min-h-screen text-stone-200">
            <div className="mb-8">
                <h1 className="text-3xl font-serif text-stone-100 mb-2">Review Management</h1>
                <p className="text-stone-400">Approve or reject pending customer reviews</p>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-lg border ${message.type === 'success'
                    ? 'bg-green-500/10 text-green-400 border-green-500/30'
                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}>
                    {message.text}
                </div>
            )}

            {reviews.length === 0 ? (
                <div className="bg-dark-800 border border-stone-800 rounded-lg p-12 text-center">
                    <p className="text-stone-500 text-lg">No pending reviews at the moment.</p>
                </div>
            ) : (
                <div className="bg-dark-800 border border-stone-800 rounded-lg overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-dark-900 border-b border-stone-800">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider">Room</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider">Rating</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider">Comment</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-stone-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-800">
                                {reviews.map((review) => (
                                    <tr key={review._id} className="hover:bg-dark-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-stone-200">{review.user?.name || 'Unknown'}</div>
                                            <div className="text-sm text-stone-500">{review.user?.email || ''}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gold-400">{review.room?.name || 'Unknown Room'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <FaStar
                                                        key={star}
                                                        className={star <= review.rating ? 'text-gold-400' : 'text-stone-700'}
                                                        size={14}
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-stone-300 max-w-xs truncate" title={review.comment}>
                                                {review.comment}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-stone-500">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge('pending')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() => handleApprove(review._id)}
                                                    className="bg-green-500/10 text-green-400 border border-green-500/50 px-3 py-1.5 rounded hover:bg-green-500 hover:text-dark-900 transition-all flex items-center gap-2 text-sm"
                                                    title="Approve"
                                                >
                                                    <FaCheck size={12} /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(review._id)}
                                                    className="bg-red-500/10 text-red-400 border border-red-500/50 px-3 py-1.5 rounded hover:bg-red-500 hover:text-dark-900 transition-all flex items-center gap-2 text-sm"
                                                    title="Reject"
                                                >
                                                    <FaTimes size={12} /> Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReviews;
