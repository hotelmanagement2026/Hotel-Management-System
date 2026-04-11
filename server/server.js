import express from 'express';
// Restart trigger
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import paymentRouter from './routes/paymentRoutes.js';
import analyticsRouter from './routes/analyticsRoutes.js';
import adminUserRouter from './routes/adminUserRoutes.js';
import adminBookingRouter from './routes/adminBookingRoutes.js';
import roomRouter from './routes/roomRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import adminReviewRouter from './routes/adminReviewRoutes.js';
import promoCodeRouter from './routes/promoCodeRoutes.js';
import invoiceRouter from './routes/invoiceRoutes.js';
import seasonalDiscountRouter from './routes/seasonalDiscountRoutes.js';
import refundRouter from './routes/refundRoutes.js';
import { getAllPayments, getPaymentSummary, exportPaymentsCSV } from './controllers/adminPaymentControllers.js';
import userAuth from './middleware/userAuth.js';
import adminAuth from './middleware/adminAuth.js';
import initScheduler from './utils/scheduler.js';

const app = express();
const PORT = process.env.PORT || 4000;
const defaultAllowedOrigins = ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"];
const configuredOrigins = [process.env.FRONTEND_URL, process.env.CORS_ORIGINS]
    .filter(Boolean)
    .flatMap((value) => value.split(','))
    .map((origin) => origin.trim())
    .filter(Boolean);
const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...configuredOrigins])];

// Log env vars for debugging
console.log('Starting server...');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Defined (Starts with ' + process.env.MONGODB_URI.substring(0, 10) + ')' : 'UNDEFINED');
console.log('Allowed CORS origins:', allowedOrigins);

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || (origin && origin.endsWith('.vercel.app'))) {
            return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
}));

import fs from 'fs';
import path from 'path';
const LOG_FILE = path.join(process.cwd(), 'server_debug.log');

// Log startup details
try {
    fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] Server starting PID: ${process.pid}\n`);
} catch (e) {
    console.error('Startup logging failed:', e);
}

app.use((req, res, next) => {
    try {
        fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] REQUEST: ${req.method} ${req.url}\n`);
    } catch (e) {
        console.error('Request logging failed:', e);
    }
    next();
});

app.get("/", (req, res) => res.send("Server is up and running!"));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/admin', adminUserRouter);
app.use('/api/admin', adminBookingRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/admin/reviews', adminReviewRouter);
app.use('/api/promocodes', promoCodeRouter);
app.use('/api/invoices', invoiceRouter);
app.use('/api/seasonal-discounts', seasonalDiscountRouter);
app.use('/api/refunds', refundRouter);

// Admin payment routes
app.get('/api/admin/payments', userAuth, adminAuth, getAllPayments);
app.get('/api/admin/payments/summary', userAuth, adminAuth, getPaymentSummary);
app.get('/api/admin/payments/export', userAuth, adminAuth, exportPaymentsCSV);

// Global Error Handler
app.use((err, req, res, next) => {
    try {
        fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ERROR: ${err.message}\nStack: ${err.stack}\n`);
    } catch (e) { }
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! Shutting down...', err);
    try {
        fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] UNCAUGHT EXCEPTION: ${err.message}\nStack: ${err.stack}\n`);
    } catch (e) { }
    process.exit(1);
});

// Handle Unhandled Rejections
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Shutting down...', err);
    try {
        fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] UNHANDLED REJECTION: ${err.message}\nStack: ${err.stack}\n`);
    } catch (e) { }
    process.exit(1);
});

const startServer = async () => {
    try {
        await connectDB();
        initScheduler();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            try {
                fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] Server listening on port ${PORT}\n`);
            } catch (e) { }
        });
    } catch (err) {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    }
};

startServer();
