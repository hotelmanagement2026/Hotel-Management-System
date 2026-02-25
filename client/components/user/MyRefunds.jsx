import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { FaUndo, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const MyRefunds = () => {
    const { user } = useAuth();
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRefunds = async () => {
            try {
                // Refactored to use api instance
                const { data } = await api.get(`/refunds/user/${user._id}`);
                if (data.success) {
                    setRefunds(data.refunds);
                }
            } catch (error) {
                console.error('Failed to load refunds:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchRefunds();
    }, [user]);

    const StatusIcon = ({ status }) => {
        switch (status) {
            case 'approved': return <FaCheckCircle className="text-green-500" />;
            case 'rejected': return <FaTimesCircle className="text-red-500" />;
            default: return <FaClock className="text-yellow-500" />;
        }
    };

    if (loading) return <div className="text-center py-8">Loading refunds...</div>;

    return (
        <div className="bg-dark-800 rounded-lg p-2">
            <h2 className="text-xl font-serif text-gold-400 mb-6 flex items-center gap-2">
                <FaUndo /> My Refunds
            </h2>

            {refunds.length === 0 ? (
                <p className="text-stone-500 italic font-serif py-4">No active refund requests.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-dark-900 text-stone-500 uppercase text-[10px] tracking-widest font-bold">
                            <tr>
                                <th className="p-4 border-b border-stone-800">Refund ID</th>
                                <th className="p-4 border-b border-stone-800">Date</th>
                                <th className="p-4 border-b border-stone-800">Reason</th>
                                <th className="p-4 border-b border-stone-800">Amount</th>
                                <th className="p-4 border-b border-stone-800">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-800">
                            {refunds.map((refund) => (
                                <tr key={refund._id} className="hover:bg-dark-700 transition-colors">
                                    <td className="p-4 font-medium text-stone-200">{refund.refundId}</td>
                                    <td className="p-4 text-xs text-stone-400">
                                        {new Date(refund.requestedAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-xs text-stone-400 max-w-xs truncate" title={refund.refundReason}>
                                        {refund.refundReason}
                                    </td>
                                    <td className="p-4 text-gold-400 font-bold">₹{refund.approvedAmount || refund.requestedAmount}</td>
                                    <td className="p-4 flex items-center gap-2 capitalize">
                                        <StatusIcon status={refund.status} />
                                        <span className={`text-[10px] font-bold tracking-wider ${refund.status === 'approved' ? 'text-green-400' :
                                            refund.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'
                                            }`}>
                                            {refund.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyRefunds;
