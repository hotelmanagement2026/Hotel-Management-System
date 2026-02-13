import mongoose from 'mongoose';
import Transaction from './server/models/Transaction.js';
import userModel from './server/models/userModel.js';

const MONGODB_URI = 'mongodb+srv://hotelmanagement2026_db_user:ZWlOCVegLnpudOJ6@hotelmanagement.6kkiore.mongodb.net/Hotel-Management';

const checkTransactions = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // find the user by email
        const user = await userModel.findOne({ email: 'abcd@gmail.com' });
        if (!user) {
            console.log('User abcd@gmail.com not found');
            return;
        }
        console.log('User found:', user._id, user.email);

        // find recent transactions
        const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(5);
        console.log('Recent 5 transactions:');
        transactions.forEach(t => {
            console.log(`ID: ${t._id}, BookingID: ${t.bookingId}, UserID: ${t.userId}, Status: ${t.status}, BookingStatus: ${t.bookingStatus}, Created: ${t.createdAt}`);
            if (t.userId && t.userId.toString() === user._id.toString()) {
                console.log('  -> MATCHES USER ID');
            } else {
                console.log('  -> DOES NOT MATCH USER ID');
            }
        });

        // specific check for user transactions
        const userTransactions = await Transaction.find({ userId: user._id });
        console.log(`\nTransactions found strictly for user ${user._id}: ${userTransactions.length}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkTransactions();
