import Refund from '../models/Refund.js';
import Transaction from '../models/Transaction.js';
import User from '../models/userModel.js';
import { sendRefundRequestEmail, sendRefundStatusEmail } from '../utils/emailTemplates/refundEmail.js';
import createRazorpayInstance from '../config/razorpay.js';

export const createRefundRequest = async (req, res) => {
    try {
        const { bookingId, refundType, reason, paymentId } = req.body;
        const userId = req.userId; // From auth middleware

        const transaction = await Transaction.findOne({ bookingId });
        if (!transaction) return res.status(404).json({ message: 'Booking not found' });

        // Calculate Refund Amount based on policy
        // Simple logic for now
        let refundableAmount = transaction.finalAmount;
        let policyName = 'Standard';

        // Example check: >7 days = 100%, 3-7 days = 50%
        const checkIn = new Date(transaction.checkIn);
        const today = new Date();
        const diffDays = Math.ceil((checkIn - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 3) refundableAmount = 0;
        else if (diffDays < 7) refundableAmount *= 0.5;

        const count = await Refund.countDocuments() + 1;
        const refundId = `REF-${new Date().getFullYear()}-${String(count).padStart(6, '0')}`;

        const newRefund = new Refund({
            refundId,
            bookingId: transaction._id,
            userId,
            transactionId: paymentId || transaction.paymentId,
            refundType,
            refundReason: reason,
            requestedAmount: transaction.finalAmount, // User asks for full usually
            approvedAmount: 0, // Set when approved
            breakdown: {
                netRefundAmount: refundableAmount
            },
            cancellationPolicySnapshot: {
                policyName,
                refundablePercentage: diffDays >= 7 ? 100 : (diffDays >= 3 ? 50 : 0)
            },
            status: 'pending'
        });

        await newRefund.save();

        // Notify User
        const user = await User.findById(userId);
        if (user) {
            await sendRefundRequestEmail({
                email: user.email,
                name: user.name,
                refundId: newRefund.refundId,
                amount: newRefund.requestedAmount
            });
        }

        // Notify Admin (TODO)

        res.status(201).json({ success: true, refund: newRefund, message: 'Refund request submitted' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllRefunds = async (req, res) => {
    try {
        const refunds = await Refund.find()
            .populate({ path: 'bookingId', select: 'roomName checkIn checkOut', model: 'Transaction' })
            .populate({ path: 'userId', select: 'name email', model: 'user' })
            .sort({ requestedAt: -1 });
        res.status(200).json({ success: true, refunds });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateRefundStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, approvedAmount, adminNotes } = req.body;
        const adminId = req.userId;

        const refund = await Refund.findById(id);
        if (!refund) return res.status(404).json({ message: 'Refund not found' });

        const transaction = await Transaction.findById(refund.bookingId);
        if (!transaction) return res.status(404).json({ success: false, message: 'Related transaction not found' });

        if (adminNotes) refund.adminNotes = adminNotes;
        refund.processedBy = adminId;
        refund.processedAt = new Date();

        if (status === 'approved') {
            const payableAmount = Number(
                approvedAmount ?? refund.breakdown?.netRefundAmount ?? refund.requestedAmount ?? 0
            );
            refund.approvedAmount = payableAmount;

            if (payableAmount > 0 && refund.transactionId) {
                let razorpayInstance;
                try {
                    razorpayInstance = createRazorpayInstance();
                } catch (error) {
                    return res.status(500).json({ success: false, message: error.message });
                }

                try {
                    refund.status = 'processing';
                    await refund.save();

                    const gatewayRefund = await razorpayInstance.payments.refund(refund.transactionId, {
                        amount: Math.round(payableAmount * 100),
                        notes: {
                            reason: refund.refundReason || 'Refund approved by admin',
                            refundId: refund.refundId
                        }
                    });

                    refund.status = 'completed';
                    refund.completedAt = new Date();
                    refund.gatewayInfo = {
                        ...(refund.gatewayInfo || {}),
                        refundMethod: 'original_payment_method',
                        gatewayRefundId: gatewayRefund.id,
                        gatewayResponse: gatewayRefund
                    };

                    transaction.refundId = gatewayRefund.id;
                    transaction.refundAmount = payableAmount;
                    transaction.refundStatus = 'processed';
                    transaction.status = 'refunded';
                    await transaction.save();
                } catch (gatewayError) {
                    refund.status = 'failed';
                    refund.gatewayInfo = {
                        ...(refund.gatewayInfo || {}),
                        failureReason: gatewayError.message
                    };
                    transaction.refundStatus = 'failed';
                    transaction.failureReason = gatewayError.message;
                    await transaction.save();
                    await refund.save();
                    return res.status(500).json({
                        success: false,
                        message: `Gateway refund failed: ${gatewayError.message}`
                    });
                }
            } else {
                // Approved but no payable amount to refund.
                refund.status = 'completed';
                refund.completedAt = new Date();
                transaction.refundAmount = 0;
                transaction.refundStatus = 'no_refund';
                transaction.status = 'cancelled';
                await transaction.save();
            }
        } else if (status === 'rejected') {
            refund.status = 'rejected';
            transaction.refundAmount = 0;
            transaction.refundStatus = 'rejected';
            transaction.status = 'cancelled';
            await transaction.save();
        } else {
            refund.status = status;
        }

        await refund.save();

        // Notify User
        const user = await User.findById(refund.userId);
        if (user) {
            await sendRefundStatusEmail({
                email: user.email,
                name: user.name,
                refundId: refund.refundId,
                status: refund.status,
                amount: refund.approvedAmount || 0,
                reason: status === 'rejected' ? adminNotes : ''
            });
        }

        res.status(200).json({ success: true, refund });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserRefunds = async (req, res) => {
    try {
        const refunds = await Refund.find({ userId: req.params.userId })
            .sort({ requestedAt: -1 });
        res.status(200).json({ success: true, refunds });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
