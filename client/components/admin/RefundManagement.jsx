import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FaUndo, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const RefundManagement = () => {
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRefund, setSelectedRefund] = useState(null);
    const [actionNote, setActionNote] = useState('');
    const [actionAmount, setActionAmount] = useState('');

    const fetchRefunds = async () => {
        try {
            setLoading(true);
            // Refactored to use api instance
            const { data } = await api.get('/refunds');
            if (data.success) {
                setRefunds(data.refunds);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load refunds');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRefunds();
    }, []);

    const handleStatusUpdate = async (status) => {
        if (!selectedRefund) return;

        try {
            // Refactored to use api instance
            const { data } = await api.put(`/refunds/${selectedRefund._id}/status`, {
                status,
                adminNotes: actionNote,
                approvedAmount: status === 'approved' ? actionAmount : 0
            });

            if (data.success) {
                toast.success(`Refund ${status} successfully`);
                setRefunds(refunds.map(r => r._id === selectedRefund._id ? data.refund : r));
                setSelectedRefund(null);
                setActionNote('');
                setActionAmount('');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            pending: 'bg-yellow-900/40 text-yellow-400 border border-yellow-800',
            approved: 'bg-green-900/40 text-green-400 border border-green-800',
            rejected: 'bg-red-900/40 text-red-400 border border-red-800',
            completed: 'bg-blue-900/40 text-blue-400 border border-blue-800'
        };
        const icons = {
            pending: <FaClock className="mr-1" />,
            approved: <FaCheckCircle className="mr-1" />,
            rejected: <FaTimesCircle className="mr-1" />,
            completed: <FaCheckCircle className="mr-1" />
        };

        return (
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider flex items-center w-fit ${styles[status] || 'bg-stone-800 text-stone-400'}`}>
                {icons[status]} {status.toUpperCase()}
            </span>
        );
    };

    return (
        <div className="p-6 bg-dark-900 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-serif text-gold-400 flex items-center gap-2">
                    <FaUndo /> Refund Management
                </h1>
            </div>

            <div className="bg-dark-800 border border-stone-800 rounded-lg shadow overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-dark-900 text-stone-400 uppercase text-xs font-semibold">
                        <tr>
                            <th className="p-4 border-b border-stone-800">Refund ID</th>
                            <th className="p-4 border-b border-stone-800">Requested</th>
                            <th className="p-4 border-b border-stone-800">Guest</th>
                            <th className="p-4 border-b border-stone-800">Reason</th>
                            <th className="p-4 border-b border-stone-800">Amount</th>
                            <th className="p-4 border-b border-stone-800">Status</th>
                            <th className="p-4 border-b border-stone-800">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800 text-stone-300">
                        {loading ? (
                            <tr><td colSpan="7" className="p-8 text-center text-stone-500">Loading...</td></tr>
                        ) : refunds.length === 0 ? (
                            <tr><td colSpan="7" className="p-8 text-center text-stone-500 font-serif italic">No refund requests found.</td></tr>
                        ) : (
                            refunds.map((refund) => (
                                <tr key={refund._id} className="hover:bg-dark-700 transition-colors">
                                    <td className="p-4 font-medium text-stone-100">{refund.refundId}</td>
                                    <td className="p-4 text-sm text-stone-400">{new Date(refund.requestedAt).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <div className="text-sm font-medium text-stone-200">{refund.userId?.name}</div>
                                        <div className="text-xs text-stone-500">{refund.userId?.email}</div>
                                    </td>
                                    <td className="p-4 text-sm max-w-xs truncate text-stone-400" title={refund.refundReason}>
                                        {refund.refundReason}
                                    </td>
                                    <td className="p-4 font-medium text-gold-400">
                                        ₹{refund.approvedAmount || refund.requestedAmount}
                                    </td>
                                    <td className="p-4">
                                        <StatusBadge status={refund.status} />
                                    </td>
                                    <td className="p-4">
                                        {refund.status === 'pending' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedRefund(refund);
                                                    setActionAmount(refund.breakdown?.netRefundAmount || refund.requestedAmount);
                                                }}
                                                className="text-gold-400 hover:text-gold-300 text-sm font-medium transition-colors underline decoration-gold-400/30 underline-offset-4"
                                            >
                                                Review
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Review Modal */}
            {selectedRefund && (
                <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-dark-800 border border-stone-800 rounded-lg max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-serif font-bold text-gold-400 mb-4">Review Refund Request</h3>

                        <div className="mb-4 space-y-2 text-sm text-stone-300">
                            <p><strong className="text-stone-500">Booking ID:</strong> {selectedRefund.bookingId?._id}</p>
                            <p><strong className="text-stone-500">Policy:</strong> {selectedRefund.cancellationPolicySnapshot?.policyName}</p>
                            <p><strong className="text-stone-500">Refundable %:</strong> {selectedRefund.cancellationPolicySnapshot?.refundablePercentage}%</p>
                            <p><strong className="text-stone-500">Calculated Amount:</strong> <span className="text-gold-400 font-bold">₹{selectedRefund.breakdown?.netRefundAmount}</span></p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-stone-400 mb-1">Approved Amount</label>
                            <input
                                type="number"
                                className="w-full bg-dark-900 border border-stone-800 rounded px-3 py-2 text-stone-100 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                                value={actionAmount}
                                onChange={(e) => setActionAmount(e.target.value)}
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-stone-400 mb-1">Admin Notes (Reason)</label>
                            <textarea
                                className="w-full bg-dark-900 border border-stone-800 rounded px-3 py-2 h-24 text-stone-100 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                                value={actionNote}
                                onChange={(e) => setActionNote(e.target.value)}
                                placeholder="Enter reason for approval/rejection..."
                            ></textarea>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedRefund(null)}
                                className="px-4 py-2 border border-stone-800 rounded text-stone-400 hover:bg-dark-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleStatusUpdate('rejected')}
                                className="px-4 py-2 bg-red-900/20 text-red-400 border border-red-800/30 rounded hover:bg-red-900/40 transition-colors"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => handleStatusUpdate('approved')}
                                className="px-4 py-2 bg-gold-500 text-dark-900 rounded font-medium hover:bg-gold-600 transition-colors"
                            >
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RefundManagement;
