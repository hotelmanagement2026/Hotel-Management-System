import mongoose from 'mongoose';
import 'dotenv/config';
import Transaction from '../models/Transaction.js';

const normalizeEnv = (value) => {
    if (!value) return value;
    return value.trim().replace(/^['"]|['"]$/g, '');
};

const migrate = async () => {
    try {
        const mongoUri = normalizeEnv(process.env.MONGODB_URI);
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const result = await Transaction.updateMany(
            { status: 'success' },
            { $set: { status: 'verified' } }
        );

        console.log(`Migration successful: Updated ${result.modifiedCount} transactions.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
