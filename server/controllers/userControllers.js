import userModel from "../models/userModel.js";
import Transaction from "../models/Transaction.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'server_debug.log');

const log = (msg) => {
    try {
        fs.mkdirSync(LOG_DIR, { recursive: true });
        fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] [USER_CONTROLLER] ${msg}\n`);
    } catch (e) {
        console.error('Failed to write to log file:', e);
    }
};

export const getUserData = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        return res.json({
            success: true,
            userData: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified,
                role: user.role
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getUserBookings = async (req, res) => {
    try {
        const userId = req.userId;
        log(`getUserBookings called for userId: '${userId}' (type: ${typeof userId})`);

        const bookings = await Transaction.find({ userId: userId })
            .sort({ createdAt: -1 })
            .lean();

        log(`Found ${bookings.length} bookings for user ${userId}. First booking ID: ${bookings[0]?._id}`);

        return res.json({
            success: true,
            bookings: bookings
        });

    } catch (error) {
        log(`Get user bookings error: ${error.message}`);
        console.error('Get user bookings error:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch bookings"
        });
    }
}
