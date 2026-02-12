import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { FaDownload, FaCalendarAlt } from 'react-icons/fa';

const PaymentManagement = () => {
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [summary, setSummary] = useState({ total: 0, thisMonth: 0, thisWeek: 0 });
    const [loading, setLoading] = useState(true);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        fetchPayments();
        fetchSummary();
    }, []);

    useEffect(() => {
        filterPayments();
    }, [payments, dateFrom, dateTo]);

    const fetchPayments = async () => {
        try {
            const { data } = await api.get('/admin/payments');
            if (data.success) {
                setPayments(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const { data } = await api.get('/admin/payments/summary');
            if (data.success) {
                setSummary(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch summary:', error);
        }
    };

    const filterPayments = () => {
        let filtered = payments;

        if (dateFrom) {
            filtered = filtered.filter(payment =>
                new Date(payment.createdAt) >= new Date(dateFrom)
            );
        }

        if (dateTo) {
            filtered = filtered.filter(payment =>
                new Date(payment.createdAt) <= new Date(dateTo)
            );
        }

        setFilteredPayments(filtered);
    };

    const exportToCSV = async () => {
        try {
            const response = await api.get('/admin/payments/export', {
                params: { dateFrom, dateTo },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `payments_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export CSV');
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-stone-400">Loading payments...</div>;
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-serif text-gold-400 mb-2">Payment Management</h1>
                <p className="text-stone-400">View and manage all transactions</p>
            </div>

            {/* Revenue Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-dark-800 p-6 rounded border border-stone-800">
                    <h3 className="text-stone-400 text-sm uppercase tracking-wider mb-2">Total Revenue</h3>
                    <p className="text-3xl font-serif text-white">₹{summary.total?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-dark-800 p-6 rounded border border-stone-800">
                    <h3 className="text-stone-400 text-sm uppercase tracking-wider mb-2">This Month</h3>
                    <p className="text-3xl font-serif text-green-400">₹{summary.thisMonth?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-dark-800 p-6 rounded border border-stone-800">
                    <h3 className="text-stone-400 text-sm uppercase tracking-wider mb-2">This Week</h3>
                    <p className="text-3xl font-serif text-blue-400">₹{summary.thisWeek?.toLocaleString() || 0}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-dark-800 p-6 rounded border border-stone-800 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm text-stone-400 mb-2 uppercase tracking-wider">From Date</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full px-4 py-2 bg-dark-900 border border-stone-700 rounded text-stone-300 focus:border-gold-400 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-stone-400 mb-2 uppercase tracking-wider">To Date</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full px-4 py-2 bg-dark-900 border border-stone-700 rounded text-stone-300 focus:border-gold-400 focus:outline-none"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={exportToCSV}
                            className="w-full px-4 py-2 bg-gold-400 hover:bg-gold-500 text-dark-900 font-medium rounded transition-colors flex items-center justify-center gap-2"
                        >
                            <FaDownload />
                            Export CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Payments Table */}
            <div className="bg-dark-800 rounded border border-stone-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-dark-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs text-stone-400 uppercase tracking-wider">Transaction ID</th>
                                <th className="px-6 py-4 text-left text-xs text-stone-400 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-left text-xs text-stone-400 uppercase tracking-wider">Room</th>
                                <th className="px-6 py-4 text-left text-xs text-stone-400 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-left text-xs text-stone-400 uppercase tracking-wider">Razorpay ID</th>
                                <th className="px-6 py-4 text-left text-xs text-stone-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs text-stone-400 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-800">
                            {filteredPayments.length > 0 ? (
                                filteredPayments.map((payment) => (
                                    <tr key={payment._id} className="hover:bg-dark-700 transition-colors">
                                        <td className="px-6 py-4 text-stone-300 font-mono text-sm">{payment.orderId || 'N/A'}</td>
                                        <td className="px-6 py-4 text-stone-300">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{payment.userName || 'Guest'}</span>
                                                <span className="text-xs text-stone-500">{payment.userEmail}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-stone-300">{payment.roomName || 'N/A'}</td>
                                        <td className="px-6 py-4 text-stone-300 font-semibold">
                                            ₹{payment.amount?.toLocaleString() || 0}
                                        </td>
                                        <td className="px-6 py-4 text-stone-400 font-mono text-xs">
                                            {payment.paymentId || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded text-xs uppercase tracking-wider ${payment.status === 'verified' ? 'bg-green-900 text-green-300' :
                                                payment.status === 'cancelled' ? 'bg-red-900 text-red-300' :
                                                    'bg-yellow-900 text-yellow-300'
                                                }`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-stone-400 text-sm">
                                            <div className="flex flex-col">
                                                <span>
                                                    {new Date(payment.createdAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                                <span className="text-xs text-stone-500">
                                                    {new Date(payment.createdAt).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    })}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-stone-500">
                                        No payments found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PaymentManagement;
