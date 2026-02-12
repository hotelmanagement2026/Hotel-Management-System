import express from 'express';
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
import { getAllPayments, getPaymentSummary, exportPaymentsCSV } from './controllers/adminPaymentControllers.js';
import userAuth from './middleware/userAuth.js';
import adminAuth from './middleware/adminAuth.js';
import initScheduler from './utils/scheduler.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Log env vars for debugging
console.log('Starting server...');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Defined (Starts with ' + process.env.MONGODB_URI.substring(0, 10) + ')' : 'UNDEFINED');

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    credentials: true
}));

app.get("/", (req, res) => res.send("Server is up and running!"));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/admin', adminUserRouter);
app.use('/api/admin', adminBookingRouter);

// Admin payment routes
app.get('/api/admin/payments', userAuth, adminAuth, getAllPayments);
app.get('/api/admin/payments/summary', userAuth, adminAuth, getPaymentSummary);
app.get('/api/admin/payments/export', userAuth, adminAuth, exportPaymentsCSV);

const startServer = async () => {
    try {
        await connectDB();
        initScheduler();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    }
};

startServer();
