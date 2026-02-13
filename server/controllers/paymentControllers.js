import { createHmac } from 'crypto';
import mongoose from 'mongoose';
import createRazorpayInstance from '../config/razorpay.js';
import Transaction from '../models/Transaction.js';
import Room from '../models/Room.js';
import userModel from '../models/userModel.js';
import { sendBookingConfirmation, sendCancellationEmail } from '../utils/email.js';

export const createOrder = async (req, res) => {
    const { amount, bookingId, roomId, roomName } = req.body;

    if (!amount || Number.isNaN(Number(amount))) {
        return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    let razorpayInstance;
    try {
        razorpayInstance = createRazorpayInstance();
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }

    const options = {
        amount: Math.round(Number(amount) * 100),
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
            bookingId,
            roomId,
            roomName,
        },
    };

    try {
        const order = await razorpayInstance.orders.create(options);

        if (mongoose.connection.readyState === 1) {
            try {
                await Transaction.create({
                    bookingId,
                    roomId,
                    roomName,
                    amount: Number(amount),
                    currency: order.currency,
                    orderId: order.id,
                    status: 'created',
                    receipt: order.receipt,
                    userId: req.userId // Save user ID immediately
                });
            } catch (dbError) {
                console.log('Transaction save failed:', dbError.message);
            }
        }

        return res.status(200).json(order);
    } catch (error) {
        const razorpayMessage = error?.error?.description || error?.error?.reason;
        const message = razorpayMessage || error.message || 'Failed to create order';
        console.log('Create order failed:', message);
        return res.status(500).json({
            success: false,
            message,
        });
    }
};

export const verifyPayment = async (req, res) => {
    const { order_id, payment_id, signature, amount, bookingId, roomId, roomName, checkIn, checkOut } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!order_id || !payment_id || !signature) {
        return res.status(400).json({ success: false, message: 'Missing payment details' });
    }

    if (!secret) {
        return res.status(500).json({ success: false, message: 'Razorpay secret missing' });
    }

    const hmac = createHmac('sha256', secret);
    hmac.update(`${order_id}|${payment_id}`);
    const expectedSignature = hmac.digest('hex');

    if (expectedSignature !== signature) {
        return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const update = {
        paymentId: payment_id,
        signature,
        status: 'verified',
    };

    if (amount && !Number.isNaN(Number(amount))) {
        update.amount = Number(amount);
    }

    if (bookingId) {
        update.bookingId = bookingId;
    }
    if (roomId) {
        update.roomId = roomId;
    }
    if (roomName) {
        update.roomName = roomName;
    }
    if (checkIn) {
        update.checkIn = new Date(checkIn);
    }
    if (checkOut) {
        update.checkOut = new Date(checkOut);
    }

    if (req.userId) {
        update.userId = req.userId;
        console.log(`Associating booking ${bookingId} with user ${req.userId}`);
    } else {
        console.warn(`No userId found in request for booking ${bookingId}`);
    }

    let userEmail = '';
    let userName = '';

    if (req.userId) {
        try {
            const user = await userModel.findById(req.userId);
            if (user) {
                userEmail = user.email;
                userName = user.name;
            }
        } catch (err) {
            console.log('Error fetching user for email:', err.message);
        }
    }


    if (mongoose.connection.readyState === 1) {
        try {
            await Transaction.findOneAndUpdate(
                { orderId: order_id },
                update,
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );

            // Set room as unavailable after successful booking
            if (roomId) {
                try {
                    await Room.findByIdAndUpdate(roomId, { isAvailable: false });
                } catch (roomError) {
                    console.log('Failed to update room availability:', roomError.message);
                }
            }
        } catch (dbError) {
            console.log('Transaction update failed:', dbError.message);
        }
    }

    // Send confirmation email
    if (userEmail) {
        await sendBookingConfirmation({
            email: userEmail,
            name: userName || 'Guest',
            bookingId,
            roomName: roomName || 'Room',
            checkIn: checkIn || new Date(),
            checkOut: checkOut || new Date(),
            amount: amount,
            currency: 'INR'
        });
    }

    return res.status(200).json({ success: true, message: 'Payment verified successfully' });
};

export const getTransactions = async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ success: false, message: 'MongoDB not connected' });
    }

    try {
        const items = await Transaction.find().sort({ createdAt: -1 }).limit(50);
        return res.status(200).json({ success: true, items });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
    }
};

export const refundPayment = async (req, res) => {
    const { payment_id, amount } = req.body;

    if (!payment_id) {
        return res.status(400).json({ success: false, message: 'Missing payment_id' });
    }

    let razorpayInstance;
    try {
        razorpayInstance = createRazorpayInstance();
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }

    const refundPayload = {};
    if (amount && !Number.isNaN(Number(amount))) {
        refundPayload.amount = Math.round(Number(amount) * 100);
    }

    try {
        const refund = await razorpayInstance.payments.refund(payment_id, refundPayload);
        const refundAmount = refund.amount ? refund.amount / 100 : amount ? Number(amount) : undefined;
        const refundStatus = refund.status || 'processed';

        if (mongoose.connection.readyState === 1) {
            await Transaction.findOneAndUpdate(
                { paymentId: payment_id },
                {
                    refundId: refund.id,
                    refundAmount,
                    refundStatus,
                    status: refundStatus === 'processed' ? 'refunded' : 'refund_pending',
                },
                { new: true }
            );
        }

        return res.status(200).json({ success: true, refund });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to process refund',
            error: error.message,
        });
    }
};

export const cancelBooking = async (req, res) => {
    const { bookingId } = req.body;
    const userId = req.userId;

    if (!bookingId) {
        return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }

    try {
        const transaction = await Transaction.findOne({ bookingId });

        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Verify ownership (optional but recommended)
        if (transaction.userId && transaction.userId !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized to cancel this booking' });
        }

        if (transaction.status === 'cancelled') {
            return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
        }

        // Update status
        transaction.status = 'cancelled';
        await transaction.save();

        // Get user details for email
        let userEmail = '';
        let userName = '';
        if (userId) {
            const user = await userModel.findById(userId);
            if (user) {
                userEmail = user.email;
                userName = user.name;
            }
        }

        // Trigger emails
        if (userEmail) {
            await sendCancellationEmail({
                email: userEmail,
                name: userName || 'Guest',
                bookingId: transaction.bookingId,
                roomName: transaction.roomName,
                refundAmount: transaction.amount
            });
        }

        return res.status(200).json({ success: true, message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error('Cancellation failed:', error);
        return res.status(500).json({ success: false, message: 'Failed to cancel booking' });
    }
};
