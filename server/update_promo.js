import mongoose from 'mongoose';
import PromoCode from './models/PromoCode.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const updatePromo = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const code = 'FLASH500';
        const result = await PromoCode.findOneAndUpdate(
            { code: code },
            { minBookingAmount: 500 },
            { new: true }
        );

        if (result) {
            console.log(`Updated ${code}:`, result);
        } else {
            console.log(`Promo code ${code} not found`);
        }

    } catch (error) {
        console.error('Error updating promo:', error);
    } finally {
        await mongoose.connection.close();
    }
};

updatePromo();
