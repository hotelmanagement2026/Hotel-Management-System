import Invoice from '../models/Invoice.js';
import Transaction from '../models/Transaction.js';
import User from '../models/userModel.js';
import Room from '../models/Room.js';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';
import path from 'path';
import fs from 'fs';
import { sendInvoiceEmail } from '../utils/emailTemplates/invoiceEmail.js';

// --- Helper: Calculate Tax ---
const calculateTax = (amount) => {
    // Simplified logic: 18% GST (9% CGST + 9% SGST for same state)
    // In a real app, logic would depend on customer vs hotel state
    const taxRate = 18;
    const taxAmount = (amount * taxRate) / 100;
    const cgst = taxAmount / 2;
    const sgst = taxAmount / 2;

    return {
        taxableAmount: amount,
        taxDetails: {
            cgst: { percentage: 9, amount: cgst },
            sgst: { percentage: 9, amount: sgst },
            igst: { percentage: 0, amount: 0 },
            totalTax: taxAmount
        }
    };
};

export const generateInvoice = async (bookingId) => {
    try {
        // 1. Fetch Booking/Transaction Details
        const transaction = await Transaction.findOne({ bookingId });
        if (!transaction) {
            throw new Error('Booking not found');
        }

        // Check if invoice already exists
        const existingInvoice = await Invoice.findOne({ bookingId: transaction._id });
        if (existingInvoice) {
            return existingInvoice;
        }

        const user = await User.findById(transaction.userId);
        const room = await Room.findById(transaction.roomId);

        // 2. Prepare Line Items
        const roomPrice = transaction.basePrice || 0;
        const subtotal = transaction.subtotal || transaction.amount; // Fallback

        const lineItems = [{
            description: `${transaction.roomName} - ${transaction.nights} Nights`,
            roomType: transaction.roomName,
            checkInDate: transaction.checkIn,
            checkOutDate: transaction.checkOut,
            nights: transaction.nights,
            pricePerNight: roomPrice,
            amount: subtotal
        }];

        // 3. Tax Calculation
        const { taxDetails, taxableAmount } = calculateTax(transaction.finalAmount || transaction.amount);

        // 4. Generate Invoice Number (INV-YYYY-MM-XXXXXX)
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const count = await Invoice.countDocuments() + 1;
        const invoiceNumber = `INV-${year}-${month}-${String(count).padStart(6, '0')}`;

        // 5. Create Invoice Record
        const newInvoice = new Invoice({
            invoiceNumber,
            bookingId: transaction._id,
            userId: transaction.userId,
            issueDate: new Date(),
            customerDetails: {
                name: user ? user.name : 'Guest',
                email: user ? user.email : '',
                phone: user ? user.phone : ''
            },
            lineItems,
            destination: transaction.destination,
            discountDetails: {
                promoCode: transaction.promoCode,
                seasonalDiscount: transaction.seasonalDiscount,
                totalDiscount: transaction.totalDiscount
            },
            subtotal: subtotal,
            discountAmount: transaction.totalDiscount,
            taxableAmount: taxableAmount, // This is technically base after discount
            taxDetails: taxDetails.taxDetails, // Nested object from helper
            grandTotal: transaction.finalAmount || transaction.amount,
            paymentStatus: transaction.status === 'captured' || transaction.status === 'verified' ? 'paid' : 'pending',
            pendingAmount: transaction.status === 'captured' || transaction.status === 'verified' ? 0 : transaction.finalAmount,
            transactions: [{
                transactionId: transaction.paymentId,
                paymentMethod: 'razorpay', // inferred
                amount: transaction.finalAmount,
                date: transaction.createdAt,
                status: transaction.status
            }],
            status: 'draft'
        });

        await newInvoice.save();

        // 6. Generate PDF
        try {
            const pdfUrl = await generateInvoicePDF(newInvoice);
            newInvoice.pdfUrl = pdfUrl;
            newInvoice.status = 'sent';
            await newInvoice.save();
        } catch (pdfError) {
            console.error('PDF Generation failed:', pdfError);
            // Don't fail the whole request, just log it
        }

        // 7. Send Email
        await sendInvoiceEmail(newInvoice);

        return newInvoice;

    } catch (error) {
        console.error('Invoice generation failed:', error);
        throw error;
    }
};

// Wrapper for API route
export const createInvoice = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const invoice = await generateInvoice(bookingId);
        res.status(201).json({ success: true, invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('bookingId')
            .populate('refunds.refundId');

        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

        // Authorization check logic here usually (admin or owner)

        res.status(200).json({ success: true, invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserInvoices = async (req, res) => {
    try {
        const { userId } = req.params;
        // Security: Ensure req.user.id === userId or req.user.role === 'admin'

        const invoices = await Invoice.find({ userId }).sort({ issueDate: -1 });
        res.status(200).json({ success: true, invoices });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllInvoices = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { invoiceNumber: { $regex: search, $options: 'i' } },
                { 'customerDetails.name': { $regex: search, $options: 'i' } }
            ];
        }

        const invoices = await Invoice.find(filter)
            .sort({ issueDate: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Invoice.countDocuments(filter);

        res.status(200).json({ success: true, invoices, total, pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const downloadInvoicePDF = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice || !invoice.pdfUrl) {
            return res.status(404).json({ success: false, message: 'PDF not found' });
        }

        // Match the generator's path logic: path.join(process.cwd(), 'public', 'invoices')
        // invoice.pdfUrl already starts with /invoices/, so we join it with public
        const actualPath = path.join(process.cwd(), 'public', invoice.pdfUrl);

        if (fs.existsSync(actualPath)) {
            res.download(actualPath);
        } else {
            // Regenerate if missing
            const pdfUrl = await generateInvoicePDF(invoice);
            invoice.pdfUrl = pdfUrl;
            await invoice.save();
            const newPath = path.join(process.cwd(), 'public', pdfUrl);
            res.download(newPath);
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
