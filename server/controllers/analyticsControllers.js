import Transaction from '../models/Transaction.js';
import userModel from '../models/userModel.js';
import mongoose from 'mongoose';

export const getDashboardData = async (req, res) => {
    try {
        // 1. Total Users
        const totalUsers = await userModel.countDocuments();

        // 2. Total Revenue
        const totalRevenueResult = await Transaction.aggregate([
            { $match: { status: 'verified' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

        // 3. Total Bookings
        const totalBookings = await Transaction.countDocuments({ status: 'verified' });

        // 4. Active Bookings (verified bookings with future checkout dates)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const activeBookings = await Transaction.countDocuments({
            status: 'verified',
            checkOut: { $gte: today }
        });

        // 5. Cancelled Bookings
        const cancelledBookings = await Transaction.countDocuments({ status: 'cancelled' });

        // 6. Booking Status Distribution (for Pie Chart)
        const statusDistribution = await Transaction.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // 7. Monthly Revenue Trend (Last 12 Months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const monthlyRevenue = await Transaction.aggregate([
            {
                $match: {
                    createdAt: { $gte: twelveMonthsAgo },
                    status: 'verified'
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    revenue: { $sum: '$amount' },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 8. Recent Transactions (Last 10)
        const recentTransactionsRaw = await Transaction.find()
            .sort({ createdAt: -1 })
            .limit(10);

        // Enhance with user details
        const recentTransactions = await Promise.all(recentTransactionsRaw.map(async (t) => {
            let userName = 'Guest';
            let userEmail = '';
            try {
                if (t.userId && mongoose.Types.ObjectId.isValid(t.userId)) {
                    const u = await userModel.findById(t.userId).select('name email');
                    if (u) {
                        userName = u.name;
                        userEmail = u.email;
                    }
                }
            } catch (err) {
                console.warn(`Could not fetch user info for transaction ${t._id}:`, err.message);
            }

            return {
                ...(t.toObject ? t.toObject() : t),
                userName,
                userEmail
            };
        }));

        return res.status(200).json({
            success: true,
            data: {
                metrics: {
                    totalUsers,
                    totalRevenue,
                    totalBookings,
                    activeBookings,
                    cancelledBookings,
                },
                statusDistribution,
                monthlyRevenue,
                recentTransactions
            }
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch analytics data' });
    }
};

export const getOccupancyRate = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Total active bookings
        const activeBookings = await Transaction.countDocuments({
            status: 'verified',
            checkOut: { $gte: today }
        });

        // Assume total capacity (you can adjust this based on your rooms)
        const totalCapacity = 50; // Example: 50 rooms

        const rate = (activeBookings / totalCapacity) * 100;

        return res.status(200).json({
            success: true,
            data: { rate: Math.min(rate, 100) }
        });
    } catch (error) {
        console.error('Occupancy rate error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch occupancy rate' });
    }
};

export const getTopRooms = async (req, res) => {
    try {
        const topRooms = await Transaction.aggregate([
            { $match: { status: 'verified' } },
            { $group: { _id: '$roomName', bookings: { $sum: 1 } } },
            { $sort: { bookings: -1 } },
            { $limit: 5 },
            { $project: { roomName: '$_id', bookings: 1, _id: 0 } }
        ]);

        return res.status(200).json({
            success: true,
            data: topRooms
        });
    } catch (error) {
        console.error('Top rooms error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch top rooms' });
    }
};

export const getPeakSeason = async (req, res) => {
    try {
        const peakSeason = await Transaction.aggregate([
            { $match: { status: 'verified' } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$checkIn" } },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 12 },
            {
                $project: {
                    month: {
                        $let: {
                            vars: {
                                monthsInString: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                            },
                            in: {
                                $arrayElemAt: [
                                    '$$monthsInString',
                                    { $subtract: [{ $toInt: { $substr: ['$_id', 5, 2] } }, 1] }
                                ]
                            }
                        }
                    },
                    bookings: 1,
                    _id: 0
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            data: peakSeason
        });
    } catch (error) {
        console.error('Peak season error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch peak season' });
    }
};

export const getBookingReports = async (req, res) => {
    try {
        const { startDate, endDate, status, roomName, customerName } = req.query;

        let query = {};

        // Date Filter (applying to checkIn date, but could be flexible)
        if (startDate || endDate) {
            query.checkIn = {};
            if (startDate) query.checkIn.$gte = new Date(startDate);
            if (endDate) query.checkIn.$lte = new Date(endDate);
        }

        // Status Filter
        if (status && status !== 'all') {
            query.status = status;
        }

        // Room Filter
        if (roomName) {
            query.roomName = { $regex: roomName, $options: 'i' };
        }

        // Customer Filter (complex: find users first)
        if (customerName) {
            // This requires importing userModel at the top. 
            // I'll need to update imports first or use mongoose.model('user') if lazy.
            // Let's assume I'll add the import.
            // But wait, I can't easily add import with this tool if I'm appending.
            // I'll check if I can add it or if I need to use mongoose.models.user
        }

        // Let's handle the import in a separate step or just use mongoose.connection to get model?
        // Better to update file imports.

        // Wait, for now I will write the function assuming I will fix imports.

        // actually, let's use the replace_file_content to add import AND function if possible, 
        // or just use mongoose.model('user') which is safe if model is registered.

        let userIds = [];
        if (customerName) {
            const userModel = mongoose.model('user');
            const users = await userModel.find({ name: { $regex: customerName, $options: 'i' } }).select('_id');
            userIds = users.map(u => u._id);
            if (userIds.length > 0) {
                query.userId = { $in: userIds };
            } else {
                // If name search yields no users, then no transactions should match
                return res.status(200).json({ success: true, data: [], summary: { total: 0, revenue: 0 } });
            }
        }

        console.log("Reports Query:", query);
        const transactions = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .limit(100);

        console.log("Transactions found:", transactions.length);

        const summary = transactions.reduce((acc, curr) => {
            acc.total += 1;
            if (curr.status === 'verified') {
                acc.revenue += curr.amount || 0;
            }
            return acc;
        }, { total: 0, revenue: 0 });

        const enhancedTransactions = await Promise.all(transactions.map(async (t) => {
            let userName = 'Guest';
            let userEmail = '';
            try {
                if (t.userId && mongoose.Types.ObjectId.isValid(t.userId)) {
                    const userModel = mongoose.model('user');
                    const u = await userModel.findById(t.userId).select('name email');
                    if (u) {
                        userName = u.name;
                        userEmail = u.email;
                    }
                }
            } catch (err) {
                console.warn(`Could not fetch user info for transaction ${t._id}:`, err.message);
            }

            return {
                ...(t.toObject ? t.toObject() : t),
                userName,
                userEmail
            };
        }));

        console.log("Enhanced Transactions count:", enhancedTransactions.length);

        return res.status(200).json({
            success: true,
            data: enhancedTransactions,
            summary
        });

    } catch (error) {
        console.error('Reports Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch reports' });
    }
};
