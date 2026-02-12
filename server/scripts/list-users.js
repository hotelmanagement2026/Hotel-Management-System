import mongoose from 'mongoose';
import 'dotenv/config';
import userModel from '../models/userModel.js';

const normalizeEnv = (value) => {
    if (!value) return value;
    return value.trim().replace(/^['"]|['"]$/g, '');
};

const listUsers = async () => {
    try {
        const mongoUri = normalizeEnv(process.env.MONGODB_URI);
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const users = await userModel.find({}, 'name email role');
        console.log('User List:', JSON.stringify(users, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error listing users:', error);
        if (error.stack) console.error(error.stack);
        process.exit(1);
    }
};

listUsers();
