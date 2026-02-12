import mongoose from 'mongoose';
import 'dotenv/config';
import Transaction from '../models/Transaction.js';
import userModel from '../models/userModel.js';

const normalizeEnv = (value) => {
    if (!value) return value;
    return value.trim().replace(/^['"]|['"]$/g, '');
};

const checkDB = async () => {
    try {
        const mongoUri = normalizeEnv(process.env.MONGODB_URI);
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const totalTransactions = await Transaction.countDocuments();
        console.log('Total Transactions:', totalTransactions);

        const statusCounts = await Transaction.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        console.log('Status Distribution:', JSON.stringify(statusCounts, null, 2));

        const sampleTransactions = await Transaction.find().limit(5);
        console.log('Sample Transactions:', JSON.stringify(sampleTransactions, null, 2));

        const userModel = mongoose.model('user');
        const totalUsers = await userModel.countDocuments();
        console.log('Total Users:', totalUsers);

        const adminUsers = await userModel.find({ role: 'admin' }).select('name email role');
        console.log('Admin Users:', JSON.stringify(adminUsers, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error checking DB:', error);
        process.exit(1);
    }
};

checkDB();
