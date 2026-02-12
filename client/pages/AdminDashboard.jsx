import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../utils/api';

const AdminDashboard = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const { data } = await api.get('/analytics/dashboard');
                if (data.success) {
                    setAnalyticsData(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (isLoadingData) {
        return <div className="p-8 text-center text-stone-400">Loading Analytics Data...</div>;
    }

    if (!analyticsData || !analyticsData.metrics) {
        return (
            <div className="p-8 text-center text-stone-400">
                <p className="mb-4">No analytics data available or failed to load.</p>
                <Link to="/admin/reports" className="text-gold-400 border-b border-gold-400">Try jumping to reports</Link>
            </div>
        );
    }

    const { metrics, statusDistribution, monthlyRevenue, recentTransactions } = analyticsData;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    // Format month names for better display
    const formattedMonthlyRevenue = monthlyRevenue.map(item => ({
        ...item,
        month: new Date(item._id + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }));

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-serif text-gold-400 mb-2">Admin Dashboard</h1>
                <p className="text-stone-400">Overview of hotel operations and metrics</p>
            </div>

            {/* Key Metrics - 5 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
                <div className="bg-dark-800 p-6 rounded border border-stone-800 hover:border-gold-400 transition-colors">
                    <h3 className="text-stone-400 text-sm uppercase tracking-wider mb-2">Total Users</h3>
                    <p className="text-3xl font-serif text-white">{metrics.totalUsers}</p>
                </div>
                <div className="bg-dark-800 p-6 rounded border border-stone-800 hover:border-gold-400 transition-colors">
                    <h3 className="text-stone-400 text-sm uppercase tracking-wider mb-2">Total Bookings</h3>
                    <p className="text-3xl font-serif text-white">{metrics.totalBookings}</p>
                </div>
                <div className="bg-dark-800 p-6 rounded border border-stone-800 hover:border-gold-400 transition-colors">
                    <h3 className="text-stone-400 text-sm uppercase tracking-wider mb-2">Total Revenue</h3>
                    <p className="text-3xl font-serif text-white">₹{metrics.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-dark-800 p-6 rounded border border-stone-800 hover:border-green-400 transition-colors">
                    <h3 className="text-stone-400 text-sm uppercase tracking-wider mb-2">Active Bookings</h3>
                    <p className="text-3xl font-serif text-green-400">{metrics.activeBookings}</p>
                </div>
                <div className="bg-dark-800 p-6 rounded border border-stone-800 hover:border-red-400 transition-colors">
                    <h3 className="text-stone-400 text-sm uppercase tracking-wider mb-2">Cancelled Bookings</h3>
                    <p className="text-3xl font-serif text-red-400">{metrics.cancelledBookings}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Monthly Revenue Chart */}
                <div className="bg-dark-800 p-6 rounded border border-stone-800">
                    <h3 className="text-xl font-serif text-stone-100 mb-6">Monthly Revenue Chart</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={formattedMonthlyRevenue}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="month" stroke="#888" angle={-45} textAnchor="end" height={80} />
                            <YAxis stroke="#888" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1c1917', border: '1px solid #333' }}
                                itemStyle={{ color: '#d4af37' }}
                            />
                            <Legend />
                            <Bar dataKey="revenue" fill="#d4af37" name="Revenue (₹)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Booking Status Distribution */}
                <div className="bg-dark-800 p-6 rounded border border-stone-800">
                    <h3 className="text-xl font-serif text-stone-100 mb-6">Booking Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="_id"
                            >
                                {statusDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1c1917', border: '1px solid #333' }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-dark-800 p-6 rounded border border-stone-800">
                <h3 className="text-xl font-serif text-stone-100 mb-6">Recent Transactions</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-stone-700">
                                <th className="pb-3 text-stone-400 text-sm uppercase tracking-wider">Booking ID</th>
                                <th className="pb-3 text-stone-400 text-sm uppercase tracking-wider">Customer</th>
                                <th className="pb-3 text-stone-400 text-sm uppercase tracking-wider">Room</th>
                                <th className="pb-3 text-stone-400 text-sm uppercase tracking-wider">Amount</th>
                                <th className="pb-3 text-stone-400 text-sm uppercase tracking-wider">Status</th>
                                <th className="pb-3 text-stone-400 text-sm uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTransactions && recentTransactions.length > 0 ? (
                                recentTransactions.map((transaction) => (
                                    <tr key={transaction._id} className="border-b border-stone-800 hover:bg-dark-700 transition-colors">
                                        <td className="py-4 text-stone-300 font-mono text-sm">{transaction.bookingId || 'N/A'}</td>
                                        <td className="py-4 text-stone-300">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{transaction.userName}</span>
                                                <span className="text-xs text-stone-500">{transaction.userEmail}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-stone-300">{transaction.roomName || 'N/A'}</td>
                                        <td className="py-4 text-stone-300 font-semibold">₹{transaction.amount?.toLocaleString() || 0}</td>
                                        <td className="py-4">
                                            <span className={`px-3 py-1 rounded text-xs uppercase tracking-wider ${transaction.status === 'verified' ? 'bg-green-900 text-green-300' :
                                                    transaction.status === 'cancelled' ? 'bg-red-900 text-red-300' :
                                                        'bg-yellow-900 text-yellow-300'
                                                }`}>
                                                {transaction.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-stone-400 text-sm">
                                            {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-stone-500">No recent transactions</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
