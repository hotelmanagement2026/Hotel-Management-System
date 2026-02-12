import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userModel from '../models/userModel.js';

dotenv.config();

const promoteUser = async (email) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const user = await userModel.findOneAndUpdate(
            { email: email },
            { role: 'admin' },
            { new: true }
        );

        if (user) {
            console.log(`Success: ${user.name} (${user.email}) is now an ADMIN.`);
        } else {
            console.log(`Error: User with email ${email} not found.`);
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
};

// You can change the email here to promote a different user
const emailToPromote = 'beladas1980@gmail.com';
promoteUser(emailToPromote);
