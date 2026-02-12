import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Reports = () => {
    const [revenueData, setRevenueData] = useState([]);
    const [occupancyRate, setOccupancyRate] = useState(0);
    const [topRooms, setTopRooms] = useState([]);
    const [peakSeason, setPeakSeason] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('monthly'); // 'daily' or 'monthly'

    useEffect(() => {
        fetchReportsData();
    }, [viewMode]);

    const fetchReportsData = async () => {
        try {
            // Fetch revenue analytics
            const revenueRes = await api.get('/analytics/dashboard');
            if (revenueRes.data.success) {
                const { monthlyRevenue } = revenueRes.data.data;
                setRevenueData(monthlyRevenue || []);
            }

            // Fetch occupancy rate
            const occupancyRes = await api.get('/analytics/occupancy');
            if (occupancyRes.data.success) {
                setOccupancyRate(occupancyRes.data.data.rate || 0);
            }

            // Fetch top rooms
            const topRoomsRes = await api.get('/analytics/top-rooms');
            if (topRoomsRes.data.success) {
                setTopRooms(topRoomsRes.data.data || []);
            }

            // Fetch peak season
            const peakSeasonRes = await api.get('/analytics/peak-season');
            if (peakSeasonRes.data.success) {
                setPeakSeason(peakSeasonRes.data.data || []);
            }

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
            setLoading(false);
        }
    };

    const formatRevenueData = () => {
        return revenueData.map(item => ({
            ...item,
            month: new Date(item._id + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        }));
    };

    if (loading) {
        return <div className="p-8 text-center text-stone-400">Loading reports...</div>;
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-serif text-gold-400 mb-2">Reports & Analytics</h1>
                <p className="text-stone-400">Comprehensive business insights and analytics</p>
            </div>

            {/* Occupancy Rate Card */}
            <div className="bg-dark-800 p-8 rounded border border-stone-800 mb-8">
                <div className="text-center">
                    <h3 className="text-stone-400 text-sm uppercase tracking-wider mb-4">Current Occupancy Rate</h3>
                    <div className="relative inline-block">
                        <svg className="w-40 h-40">
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                fill="none"
                                stroke="#292524"
                                strokeWidth="12"
                            />
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                fill="none"
                                stroke="#d4af37"
                                strokeWidth="12"
                                strokeDasharray={`${2 * Math.PI * 70}`}
                                strokeDashoffset={`${2 * Math.PI * 70 * (1 - occupancyRate / 100)}`}
                                transform="rotate(-90 80 80)"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl font-serif text-white">{occupancyRate.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Analytics */}
            <div className="bg-dark-800 p-6 rounded border border-stone-800 mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-serif text-stone-100">Revenue Analytics</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('daily')}
                            className={`px-4 py-2 rounded text-sm ${viewMode === 'daily'
                                    ? 'bg-gold-400 text-dark-900'
                                    : 'bg-dark-700 text-stone-300 hover:bg-dark-600'
                                }`}
                        >
                            Daily
                        </button>
                        <button
                            onClick={() => setViewMode('monthly')}
                            className={`px-4 py-2 rounded text-sm ${viewMode === 'monthly'
                                    ? 'bg-gold-400 text-dark-900'
                                    : 'bg-dark-700 text-stone-300 hover:bg-dark-600'
                                }`}
                        >
                            Monthly
                        </button>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formatRevenueData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="month" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1c1917', border: '1px solid #333' }}
                            itemStyle={{ color: '#d4af37' }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#d4af37"
                            strokeWidth={2}
                            name="Revenue (₹)"
                            dot={{ fill: '#d4af37', r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Most Booked Rooms */}
                <div className="bg-dark-800 p-6 rounded border border-stone-800">
                    <h3 className="text-xl font-serif text-stone-100 mb-6">Most Booked Rooms</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topRooms} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis type="number" stroke="#888" />
                            <YAxis dataKey="roomName" type="category" stroke="#888" width={120} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1c1917', border: '1px solid #333' }}
                                itemStyle={{ color: '#d4af37' }}
                            />
                            <Bar dataKey="bookings" fill="#d4af37" name="Bookings" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Peak Booking Season */}
                <div className="bg-dark-800 p-6 rounded border border-stone-800">
                    <h3 className="text-xl font-serif text-stone-100 mb-6">Peak Booking Season</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={peakSeason}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="month" stroke="#888" />
                            <YAxis stroke="#888" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1c1917', border: '1px solid #333' }}
                                itemStyle={{ color: '#10b981' }}
                            />
                            <Bar dataKey="bookings" fill="#10b981" name="Bookings" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Reports;
