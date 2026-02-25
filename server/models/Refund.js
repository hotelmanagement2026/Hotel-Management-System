import mongoose from 'mongoose';

const refundSchema = new mongoose.Schema({
    refundId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: true,
        index: true
    },
    invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    transactionId: {
        type: String, // Original payment transaction ID
        required: true
    },

    // Refund Details
    refundType: {
        type: String,
        enum: ['full', 'partial', 'cancellation', 'service_issue', 'duplicate_payment', 'other'],
        required: true
    },
    requestedAmount: { type: Number, required: true },
    approvedAmount: { type: Number },
    refundReason: { type: String, required: true },

    cancellationPolicySnapshot: {
        policyName: String,
        penaltyPercentage: Number,
        penaltyAmount: Number,
        refundablePercentage: Number
    },

    // Refund Breakdown
    breakdown: {
        roomCharges: { type: Number, default: 0 },
        taxRefund: { type: Number, default: 0 },
        discountAdjustment: { type: Number, default: 0 },
        processingFee: { type: Number, default: 0 },
        netRefundAmount: { type: Number }
    },

    // Status Tracking
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'processing', 'completed', 'failed'],
        default: 'pending',
        index: true
    },

    // Timeline
    requestedAt: { type: Date, default: Date.now },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // User or Admin

    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // Admin who approved/rejected
    processedAt: { type: Date }, // Approval/Rejection date
    adminNotes: { type: String },

    completedAt: { type: Date }, // When money was actually refunded

    // Payment Gateway Info
    gatewayInfo: {
        refundMethod: { type: String, enum: ['original_payment_method', 'bank_transfer', 'wallet'] },
        gatewayRefundId: { type: String },
        gatewayResponse: { type: Object },
        expectedCreditDate: { type: Date },
        actualCreditDate: { type: Date },
        failureReason: { type: String }
    },

    // Documentation
    attachments: [{ type: String }], // URLs to proofs
    customerNotified: { type: Boolean, default: false },
    notificationSentAt: { type: Date }

}, { timestamps: true });

const Refund = mongoose.models.Refund || mongoose.model('Refund', refundSchema);

export default Refund;
