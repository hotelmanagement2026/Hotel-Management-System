import mongoose from 'mongoose';
import Transaction from './models/Transaction.js';
import userModel from './models/userModel.js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const OUTPUT_FILE = 'debug_output.txt';

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync(OUTPUT_FILE, msg + '\n');
};

const checkTransactions = async () => {
    try {
        // Clear previous output
        fs.writeFileSync(OUTPUT_FILE, '');

        if (!MONGODB_URI) {
            log('MONGODB_URI is missing from .env');
            return;
        }

        await mongoose.connect(MONGODB_URI);
        log('Connected to MongoDB');

        // find the user by email
        const user = await userModel.findOne({ email: 'abcd@gmail.com' });
        if (!user) {
            log('User abcd@gmail.com not found');
            return;
        }
        log(`User found: ${user._id} (${user.email})`);

        // find recent transactions
        const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(10);
        log('\nRecent 10 transactions:');
        transactions.forEach(t => {
            const isMatch = t.userId && t.userId.toString() === user._id.toString();
            log(`[${t.createdAt.toISOString()}] BookingID: ${t.bookingId}, UserID: ${t.userId || 'NULL'}, Status: ${t.status}, Match: ${isMatch}`);
        });

        // specific check for user transactions
        const userTransactions = await Transaction.find({ userId: user._id });
        log(`\nTotal transactions found strictly for user ${user._id}: ${userTransactions.length}`);

    } catch (error) {
        log(`Error: ${error.message}`);
    } finally {
        await mongoose.disconnect();
    }
};

checkTransactions();
