import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '../utils/api';
import Button from '../components/ui/Button';

const BookingReports = () => {
    const { user, loading } = useAuth();

    // Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState('all');
    const [roomName, setRoomName] = useState('');
    const [customerName, setCustomerName] = useState('');

    // Data
    const [reportsData, setReportsData] = useState({ data: [], summary: { total: 0, revenue: 0 } });
    const [isLoadingData, setIsLoadingData] = useState(false);

    const fetchReports = async () => {
        setIsLoadingData(true);
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (status !== 'all') params.status = status;
            if (roomName) params.roomName = roomName;
            if (customerName) params.customerName = customerName;

            console.log("Fetching reports with params:", params);
            const { data } = await api.get('/analytics/reports', { params });
            console.log("Reports API response:", data);
            if (data.success) {
                setReportsData(data);
            }
        } catch (error) {
            console.error("Failed to fetch reports:", error);
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchReports();
        }
    }, [user]);

    if (loading) return <div className="pt-24 text-center text-stone-400">Loading...</div>;

    if (!user || user.role !== 'admin') {
        return <Navigate to="/" />;
    }

    const { data: transactions, summary } = reportsData;

    return (
        <div className="pt-24 min-h-screen bg-dark-900 text-stone-200">
            <div className="container mx-auto px-6 py-12">
                <h1 className="text-3xl font-serif text-gold-400 mb-8">Booking Reports</h1>

                {/* Filters */}
                <div className="bg-dark-800 p-6 rounded border border-stone-800 mb-8">
                    <h3 className="text-lg font-serif text-stone-100 mb-4">Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-dark-900 border border-stone-700 rounded px-3 py-2 text-stone-200 focus:border-gold-400 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-dark-900 border border-stone-700 rounded px-3 py-2 text-stone-200 focus:border-gold-400 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full bg-dark-900 border border-stone-700 rounded px-3 py-2 text-stone-200 focus:border-gold-400 outline-none"
                            >
                                <option value="all">All Statuses</option>
                                <option value="verified">Confirmed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="created">Pending</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">Room Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Deluxe Suite"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                className="w-full bg-dark-900 border border-stone-700 rounded px-3 py-2 text-stone-200 focus:border-gold-400 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">Customer</label>
                            <input
                                type="text"
                                placeholder="Name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full bg-dark-900 border border-stone-700 rounded px-3 py-2 text-stone-200 focus:border-gold-400 outline-none"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button onClick={fetchReports} disabled={isLoadingData}>
                            {isLoadingData ? 'Loading...' : 'Apply Filters'}
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-dark-800 p-4 rounded border border-stone-800">
                        <p className="text-stone-400 text-xs uppercase tracking-wider">Filtered Bookings</p>
                        <p className="text-2xl font-serif text-white">{summary.total}</p>
                    </div>
                    <div className="bg-dark-800 p-4 rounded border border-stone-800">
                        <p className="text-stone-400 text-xs uppercase tracking-wider">Filtered Revenue</p>
                        <p className="text-2xl font-serif text-gold-400">₹{summary.revenue.toLocaleString()}</p>
                    </div>
                </div>

                {/* Results Table */}
                <div className="bg-dark-800 rounded border border-stone-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-dark-900 text-stone-400 text-xs uppercase tracking-wider border-b border-stone-800">
                                <tr>
                                    <th className="px-6 py-4">Booking ID</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Room</th>
                                    <th className="px-6 py-4">Check-in</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-800">
                                {transactions.length > 0 ? (
                                    transactions.map((t) => (
                                        <tr key={t._id} className="hover:bg-start-900/50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-mono text-stone-500">{t.bookingId}</td>
                                            <td className="px-6 py-4 text-stone-300">{new Date(t.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <p className="text-stone-200 font-medium">{t.userName}</p>
                                                <p className="text-stone-500 text-xs">{t.userEmail}</p>
                                            </td>
                                            <td className="px-6 py-4 text-stone-300">{t.roomName}</td>
                                            <td className="px-6 py-4 text-stone-300">{t.checkIn ? new Date(t.checkIn).toLocaleDateString() : '-'}</td>
                                            <td className="px-6 py-4 text-gold-400 font-medium">₹{t.amount.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-[10px] uppercase tracking-wider border rounded ${t.status === 'verified' ? 'border-green-500 text-green-500' :
                                                    t.status === 'cancelled' ? 'border-red-500 text-red-500' :
                                                        t.status === 'refunded' ? 'border-blue-500 text-blue-500' :
                                                            'border-yellow-500 text-yellow-500'
                                                    }`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-stone-500">
                                            No bookings found matching filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BookingReports;
