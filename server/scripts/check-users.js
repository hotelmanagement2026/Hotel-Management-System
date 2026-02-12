import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userModel from '../models/userModel.js';

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await userModel.find({}, 'name email role');
        console.log('User List:');
        users.forEach(user => {
            console.log(`- ${user.name} (${user.email}): Role = ${user.role}`);
        });

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkUsers();
