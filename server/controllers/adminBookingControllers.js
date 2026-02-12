import Transaction from '../models/Transaction.js';
import userModel from '../models/userModel.js';
import mongoose from 'mongoose';

export const getAllBookings = async (req, res) => {
    try {
        const { dateFrom, dateTo, roomName } = req.query;

        let query = {};

        if (dateFrom || dateTo) {
            query.checkIn = {};
            if (dateFrom) query.checkIn.$gte = new Date(dateFrom);
            if (dateTo) query.checkIn.$lte = new Date(dateTo);
        }

        if (roomName && roomName !== 'all') {
            query.roomName = roomName;
        }

        const bookings = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .limit(200);

        // Enhance with user details
        const enhancedBookings = await Promise.all(bookings.map(async (booking) => {
            let userName = 'Guest';
            let userEmail = '';

            try {
                if (booking.userId && mongoose.Types.ObjectId.isValid(booking.userId)) {
                    const user = await userModel.findById(booking.userId).select('name email');
                    if (user) {
                        userName = user.name;
                        userEmail = user.email;
                    }
                }
            } catch (err) {
                console.warn(`Could not fetch user for booking ${booking._id}`);
            }

            return {
                ...(booking.toObject ? booking.toObject() : booking),
                userName,
                userEmail
            };
        }));

        return res.status(200).json({
            success: true,
            data: enhancedBookings
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Transaction.findByIdAndUpdate(
            id,
            { status: 'cancelled' },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            data: booking
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        return res.status(500).json({ success: false, message: 'Failed to cancel booking' });
    }
};

export const completeBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Transaction.findByIdAndUpdate(
            id,
            { status: 'completed' },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Booking marked as completed',
            data: booking
        });
    } catch (error) {
        console.error('Complete booking error:', error);
        return res.status(500).json({ success: false, message: 'Failed to complete booking' });
    }
};
