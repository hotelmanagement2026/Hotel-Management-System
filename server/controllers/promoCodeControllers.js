import PromoCode from '../models/PromoCode.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'server_debug.log');

const writeLog = (line) => {
    try {
        fs.mkdirSync(LOG_DIR, { recursive: true });
        fs.appendFileSync(LOG_FILE, line);
    } catch (e) { }
};

// Validate promo code (Public - requires user authentication)
export const validatePromoCode = async (req, res) => {
    try {
        const { code, bookingAmount, roomType } = req.body;

        // Log to file
        writeLog(`[${new Date().toISOString()}] PROMO CHECK: Code=${code}, Amount=${bookingAmount}, Room=${roomType}\n`);

        if (!code || !bookingAmount) {
            return res.status(400).json({
                success: false,
                message: 'Promo code and booking amount are required'
            });
        }

        if (bookingAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Booking amount must be greater than 0'
            });
        }

        // Find promo code (case-insensitive)
        const promoCode = await PromoCode.findOne({
            code: code.toUpperCase()
        });

        if (!promoCode) {
            writeLog(`[${new Date().toISOString()}] PROMO FAIL: Code ${code} not found\n`);
            return res.status(404).json({
                success: false,
                message: 'Invalid promo code'
            });
        }

        // Check if promo can be applied
        const validation = promoCode.canApplyToBooking(bookingAmount, roomType);

        writeLog(`[${new Date().toISOString()}] PROMO RESULT: ${JSON.stringify(validation)} | Details: ValidFrom=${promoCode.validFrom}, MinAmount=${promoCode.minBookingAmount}, Types=${promoCode.applicableRoomTypes}\n`);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.reason
            });
        }

        // Calculate discount
        const discountAmount = promoCode.calculateDiscount(bookingAmount);

        return res.status(200).json({
            success: true,
            message: 'Promo code is valid',
            data: {
                code: promoCode.code,
                description: promoCode.description,
                discountType: promoCode.discountType,
                discountValue: promoCode.discountValue,
                discountAmount: discountAmount,
                finalAmount: bookingAmount - discountAmount
            }
        });
    } catch (error) {
        console.error('Validate promo code error:', error);
        writeLog(`[${new Date().toISOString()}] PROMO ERROR: ${error.message}\n`);
        return res.status(500).json({
            success: false,
            message: 'Failed to validate promo code'
        });
    }
};

// Create promo code (Admin only)
export const createPromoCode = async (req, res) => {
    try {
        const {
            code,
            description,
            discountType,
            discountValue,
            validFrom,
            validUntil,
            usageLimit,
            minBookingAmount,
            maxDiscountAmount,
            applicableRoomTypes,
            isActive
        } = req.body;

        writeLog(`[${new Date().toISOString()}] PROMO CREATE: Code=${code}, Desc=${description}, Type=${discountType}, Val=${discountValue}\n`);

        // Validation
        if (!code || !description || !discountType || discountValue === undefined || !validFrom || !validUntil) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check if code already exists
        const existingCode = await PromoCode.findOne({ code: code.toUpperCase() });
        if (existingCode) {
            return res.status(400).json({
                success: false,
                message: 'Promo code already exists'
            });
        }

        // Validate dates
        if (new Date(validFrom) >= new Date(validUntil)) {
            return res.status(400).json({
                success: false,
                message: 'Valid until date must be after valid from date'
            });
        }

        const promoCode = new PromoCode({
            code: code.toUpperCase(),
            description,
            discountType,
            discountValue,
            validFrom,
            validUntil,
            usageLimit: usageLimit || null,
            minBookingAmount: minBookingAmount || 0,
            maxDiscountAmount: maxDiscountAmount || null,
            applicableRoomTypes: applicableRoomTypes || [],
            isActive: isActive !== undefined ? isActive : true,
            createdBy: req.userId
        });

        await promoCode.save();

        writeLog(`[${new Date().toISOString()}] PROMO CREATE SUCCESS: ${code}\n`);

        return res.status(201).json({
            success: true,
            message: 'Promo code created successfully',
            data: promoCode
        });
    } catch (error) {
        console.error('Create promo code error:', error);
        writeLog(`[${new Date().toISOString()}] PROMO CREATE ERROR: ${error.message}\n`);
        return res.status(500).json({
            success: false,
            message: 'Failed to create promo code'
        });
    }
};

// Get all promo codes (Admin only)
export const getAllPromoCodes = async (req, res) => {
    try {
        const { isActive, search } = req.query;

        let query = {};

        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        if (search) {
            query.$or = [
                { code: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const promoCodes = await PromoCode.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: promoCodes
        });
    } catch (error) {
        console.error('Get all promo codes error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch promo codes'
        });
    }
};

// Update promo code (Admin only)
export const updatePromoCode = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Don't allow changing the code itself
        delete updates.code;
        delete updates.usedCount;
        delete updates.createdBy;

        // Validate dates if provided
        if (updates.validFrom && updates.validUntil) {
            if (new Date(updates.validFrom) >= new Date(updates.validUntil)) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid until date must be after valid from date'
                });
            }
        }

        const promoCode = await PromoCode.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!promoCode) {
            return res.status(404).json({
                success: false,
                message: 'Promo code not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Promo code updated successfully',
            data: promoCode
        });
    } catch (error) {
        console.error('Update promo code error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update promo code'
        });
    }
};

// Delete promo code (Admin only)
export const deletePromoCode = async (req, res) => {
    try {
        const { id } = req.params;

        const promoCode = await PromoCode.findByIdAndDelete(id);

        if (!promoCode) {
            return res.status(404).json({
                success: false,
                message: 'Promo code not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Promo code deleted successfully'
        });
    } catch (error) {
        console.error('Delete promo code error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete promo code'
        });
    }
};

// Increment promo usage (Internal use)
export const incrementPromoUsage = async (code) => {
    try {
        const promoCode = await PromoCode.findOne({ code: code.toUpperCase() });

        if (promoCode) {
            promoCode.usedCount += 1;
            await promoCode.save();
            return true;
        }

        return false;
    } catch (error) {
        console.error('Increment promo usage error:', error);
        return false;
    }
};
