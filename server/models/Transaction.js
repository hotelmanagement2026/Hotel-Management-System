import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
    {
        bookingId: { type: String },
        userId: { type: String, required: false },
        roomId: { type: String },
        roomName: { type: String },
        amount: { type: Number },
        currency: { type: String, default: 'INR' },
        orderId: { type: String, index: true },
        paymentId: { type: String, index: true },
        signature: { type: String },
        status: { type: String, default: 'created' },
        bookingStatus: {
            type: String,
            enum: ['confirmed', 'checked_in', 'checked_out'],
            default: 'confirmed'
        },
        receipt: { type: String },
        refundId: { type: String },
        refundAmount: { type: Number },
        refundStatus: { type: String },
        checkIn: { type: Date },
        checkOut: { type: Date },
    },
    { timestamps: true }
);

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

export default Transaction;
