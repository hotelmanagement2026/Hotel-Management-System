import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
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
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    issueDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    dueDate: {
        type: Date
    },

    // Customer Details (Snapshot)
    customerDetails: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String },
        billingAddress: {
            street: String,
            city: String,
            state: String,
            country: String,
            zipCode: String
        },
        gstin: { type: String } // For Indian hotels
    },

    // Line Items
    lineItems: [{
        description: { type: String, required: true },
        roomType: { type: String },
        checkInDate: { type: Date },
        checkOutDate: { type: Date },
        nights: { type: Number },
        pricePerNight: { type: Number },
        taxRate: { type: Number }, // percentage
        taxAmount: { type: Number },
        amount: { type: Number, required: true } // subtotal for this item
    }],

    // Discount Details
    discountDetails: {
        seasonalDiscount: {
            name: String,
            percentage: Number,
            amount: Number
        },
        promoCode: {
            code: String,
            amount: Number
        },
        totalDiscount: { type: Number, default: 0 }
    },

    // Payment Summary
    subtotal: { type: Number, required: true }, // Before tax and discount
    discountAmount: { type: Number, default: 0 },
    taxableAmount: { type: Number, required: true }, // After discount

    // Tax Breakdown
    taxDetails: {
        cgst: { percentage: Number, amount: Number },
        sgst: { percentage: Number, amount: Number },
        igst: { percentage: Number, amount: Number },
        totalTax: { type: Number, default: 0 }
    },

    grandTotal: { type: Number, required: true },

    // Payment Information
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'partially_paid', 'refunded', 'partially_refunded', 'failed', 'cancelled'],
        default: 'pending',
        index: true
    },
    paidAmount: { type: Number, default: 0 },
    pendingAmount: { type: Number, required: true },
    transactions: [{
        transactionId: String,
        paymentMethod: String,
        amount: Number,
        date: Date,
        status: String
    }],

    // Refund Tracking
    refunds: [{
        refundId: { type: mongoose.Schema.Types.ObjectId, ref: 'Refund' },
        amount: Number,
        date: Date,
        reason: String
    }],
    totalRefunded: { type: Number, default: 0 },

    // Metadata
    pdfUrl: { type: String },
    pdfGeneratedAt: { type: Date },
    sentToEmail: { type: Boolean, default: false },
    emailSentAt: { type: Date },
    notes: { type: String },
    status: {
        type: String,
        enum: ['draft', 'sent', 'viewed', 'paid', 'overdue', 'void'],
        default: 'draft'
    }
}, { timestamps: true });

// Compound index for user invoice history
invoiceSchema.index({ userId: 1, issueDate: -1 });

const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);

export default Invoice;
