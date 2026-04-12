import { createHmac } from 'crypto';
import mongoose from 'mongoose';
import createRazorpayInstance from '../config/razorpay.js';
import Transaction from '../models/Transaction.js';
import Room from '../models/Room.js';
import userModel from '../models/userModel.js';
import { sendBookingConfirmation, sendCancellationEmail } from '../utils/email.js';

const parseBookingDates = (checkIn, checkOut) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
        return { error: 'Invalid check-in or check-out date' };
    }

    if (checkOutDate <= checkInDate) {
        return { error: 'Check-out date must be after check-in date' };
    }

    return { checkInDate, checkOutDate };
};

const findOverlappingBooking = async ({ roomId, checkInDate, checkOutDate, excludeOrderId = null }) => {
    const query = {
        roomId: String(roomId),
        status: 'verified',
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate },
    };

    if (excludeOrderId) {
        query.orderId = { $ne: excludeOrderId };
    }

    return Transaction.findOne(query).select('bookingId checkIn checkOut').lean();
};

export const createOrder = async (req, res) => {
    const { amount, bookingId, roomId, roomName, checkIn, checkOut } = req.body;

    if (!amount || Number.isNaN(Number(amount))) {
        return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    if (!roomId) {
        return res.status(400).json({ success: false, message: 'Room ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
        return res.status(400).json({ success: false, message: 'Invalid room ID' });
    }

    if (!checkIn || !checkOut) {
        return res.status(400).json({ success: false, message: 'Check-in and check-out dates are required' });
    }

    const { checkInDate, checkOutDate, error: dateError } = parseBookingDates(checkIn, checkOut);
    if (dateError) {
        return res.status(400).json({ success: false, message: dateError });
    }

    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ success: false, message: 'Booking service unavailable. Please try again.' });
    }

    const room = await Room.findById(roomId).select('isAvailable').lean();
    if (!room) {
        return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (!room.isAvailable) {
        return res.status(400).json({ success: false, message: 'Room is currently unavailable' });
    }

    const overlappingBooking = await findOverlappingBooking({ roomId, checkInDate, checkOutDate });
    if (overlappingBooking) {
        return res.status(409).json({
            success: false,
            message: 'Room is already booked for the selected dates. Please choose different dates.',
        });
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
            checkIn,
            checkOut,
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
                    checkIn: checkInDate,
                    checkOut: checkOutDate,
                    userId: req.userId // Save user ID immediately
                });
            } catch (dbError) {
                console.log('Transaction save failed:', dbError.message);
            }
        }

        return res.status(200).json(order);
    } catch (error) {
        const razorpayMessage = error?.error?.description || error?.error?.reason;
        let message = razorpayMessage || error.message || 'Failed to create order';

        if (/authentication failed/i.test(message)) {
            message = 'Razorpay credentials are invalid. Set valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env.';
        }

        console.log('Create order failed:', message);
        return res.status(500).json({
            success: false,
            message,
        });
    }
};

export const verifyPayment = async (req, res) => {
    const { order_id, payment_id, signature, amount, bookingId, roomId, roomName, checkIn, checkOut, promoCode, discountAmount, seasonalDiscount } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!order_id || !payment_id || !signature) {
        return res.status(400).json({ success: false, message: 'Missing payment details' });
    }

    if (!secret) {
        return res.status(500).json({ success: false, message: 'Razorpay secret missing' });
    }

    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ success: false, message: 'Booking service unavailable. Please try again.' });
    }

    const existingTransaction = await Transaction.findOne({ orderId: order_id })
        .select('roomId checkIn checkOut')
        .lean();

    const resolvedRoomId = roomId || existingTransaction?.roomId;
    const resolvedCheckIn = checkIn || existingTransaction?.checkIn;
    const resolvedCheckOut = checkOut || existingTransaction?.checkOut;

    if (!resolvedRoomId || !resolvedCheckIn || !resolvedCheckOut) {
        return res.status(400).json({ success: false, message: 'Booking dates are required for payment verification' });
    }

    if (!mongoose.Types.ObjectId.isValid(resolvedRoomId)) {
        return res.status(400).json({ success: false, message: 'Invalid room ID' });
    }

    const { checkInDate, checkOutDate, error: dateError } = parseBookingDates(resolvedCheckIn, resolvedCheckOut);
    if (dateError) {
        return res.status(400).json({ success: false, message: dateError });
    }

    const room = await Room.findById(resolvedRoomId).select('isAvailable').lean();
    if (!room) {
        return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (!room.isAvailable) {
        return res.status(400).json({ success: false, message: 'Room is currently unavailable' });
    }

    const overlappingBooking = await findOverlappingBooking({
        roomId: resolvedRoomId,
        checkInDate,
        checkOutDate,
        excludeOrderId: order_id,
    });

    if (overlappingBooking) {
        return res.status(409).json({
            success: false,
            message: 'Room is already booked for the selected dates. Please choose different dates.',
        });
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
        promoCode,
        discountAmount,
        seasonalDiscount
    };

    if (amount && !Number.isNaN(Number(amount))) {
        update.amount = Number(amount);
    }

    if (bookingId) {
        update.bookingId = bookingId;
    }
    if (resolvedRoomId) {
        update.roomId = resolvedRoomId;
    }
    if (roomName) {
        update.roomName = roomName;
    }
    update.checkIn = checkInDate;
    update.checkOut = checkOutDate;

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
    try {
        await Transaction.findOneAndUpdate(
            { orderId: order_id },
            update,
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
    } catch (dbError) {
        console.log('Transaction update failed:', dbError.message);
    }

    // Send confirmation email
    if (userEmail) {
        await sendBookingConfirmation({
            email: userEmail,
            name: userName || 'Guest',
            bookingId,
            roomName: roomName || 'Room',
            checkIn: checkInDate,
            checkOut: checkOutDate,
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
