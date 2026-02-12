import Transaction from '../models/Transaction.js';
import userModel from '../models/userModel.js';
import mongoose from 'mongoose';

export const getAllPayments = async (req, res) => {
    try {
        const { dateFrom, dateTo } = req.query;

        let query = {};

        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
            if (dateTo) query.createdAt.$lte = new Date(dateTo);
        }

        const payments = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .limit(200);

        // Enhance with user details
        const enhancedPayments = await Promise.all(payments.map(async (payment) => {
            let userName = 'Guest';
            let userEmail = '';

            try {
                if (payment.userId && mongoose.Types.ObjectId.isValid(payment.userId)) {
                    const user = await userModel.findById(payment.userId).select('name email');
                    if (user) {
                        userName = user.name;
                        userEmail = user.email;
                    }
                }
            } catch (err) {
                console.warn(`Could not fetch user for payment ${payment._id}`);
            }

            return {
                ...(payment.toObject ? payment.toObject() : payment),
                userName,
                userEmail
            };
        }));

        return res.status(200).json({
            success: true,
            data: enhancedPayments
        });
    } catch (error) {
        console.error('Get payments error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch payments' });
    }
};

export const getPaymentSummary = async (req, res) => {
    try {
        // Total revenue
        const totalResult = await Transaction.aggregate([
            { $match: { status: 'verified' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const total = totalResult.length > 0 ? totalResult[0].total : 0;

        // This month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const thisMonthResult = await Transaction.aggregate([
            {
                $match: {
                    status: 'verified',
                    createdAt: { $gte: startOfMonth }
                }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const thisMonth = thisMonthResult.length > 0 ? thisMonthResult[0].total : 0;

        // This week
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const thisWeekResult = await Transaction.aggregate([
            {
                $match: {
                    status: 'verified',
                    createdAt: { $gte: startOfWeek }
                }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const thisWeek = thisWeekResult.length > 0 ? thisWeekResult[0].total : 0;

        return res.status(200).json({
            success: true,
            data: { total, thisMonth, thisWeek }
        });
    } catch (error) {
        console.error('Get payment summary error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch payment summary' });
    }
};

export const exportPaymentsCSV = async (req, res) => {
    try {
        const { dateFrom, dateTo } = req.query;

        let query = {};

        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
            if (dateTo) query.createdAt.$lte = new Date(dateTo);
        }

        const payments = await Transaction.find(query).sort({ createdAt: -1 });

        // Enhance with user details
        const enhancedPayments = await Promise.all(payments.map(async (payment) => {
            let userName = 'Guest';
            let userEmail = '';

            try {
                if (payment.userId && mongoose.Types.ObjectId.isValid(payment.userId)) {
                    const user = await userModel.findById(payment.userId).select('name email');
                    if (user) {
                        userName = user.name;
                        userEmail = user.email;
                    }
                }
            } catch (err) {
                console.warn(`Could not fetch user for payment ${payment._id}`);
            }

            return {
                ...payment.toObject(),
                userName,
                userEmail
            };
        }));

        // Generate CSV
        const csvHeader = 'Transaction ID,Customer Name,Customer Email,Room,Amount,Status,Payment ID,Date\n';
        const csvRows = enhancedPayments.map(p =>
            `${p.orderId || 'N/A'},${p.userName},${p.userEmail},${p.roomName || 'N/A'},${p.amount || 0},${p.status},${p.paymentId || 'N/A'},${new Date(p.createdAt).toLocaleDateString()}`
        ).join('\n');

        const csv = csvHeader + csvRows;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=payments.csv');
        return res.status(200).send(csv);
    } catch (error) {
        console.error('Export CSV error:', error);
        return res.status(500).json({ success: false, message: 'Failed to export CSV' });
    }
};
