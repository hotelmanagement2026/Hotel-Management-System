import mongoose from 'mongoose';
import 'dotenv/config';
import userModel from '../models/userModel.js';

const normalizeEnv = (value) => {
    if (!value) return value;
    return value.trim().replace(/^['"]|['"]$/g, '');
};

const findUser = async (id) => {
    try {
        const mongoUri = normalizeEnv(process.env.MONGODB_URI);
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const user = await userModel.findById(id);
        if (user) {
            console.log('Target User:', JSON.stringify({ name: user.name, email: user.email, role: user.role }, null, 2));
        } else {
            console.log('User not found');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

findUser('698c3cf3e55f5d5270af1986');
