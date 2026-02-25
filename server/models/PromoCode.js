import mongoose from 'mongoose';

const promoCodeSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            index: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        discountType: {
            type: String,
            enum: ['percentage', 'fixed'],
            required: true
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0,
            validate: {
                validator: function (value) {
                    if (this.discountType === 'percentage') {
                        return value >= 0 && value <= 100;
                    }
                    return value >= 0;
                },
                message: 'Percentage discount must be between 0 and 100'
            }
        },
        validFrom: {
            type: Date,
            required: true,
            index: true
        },
        validUntil: {
            type: Date,
            required: true,
            index: true
        },
        usageLimit: {
            type: Number,
            default: null, // null means unlimited
            min: 0
        },
        usedCount: {
            type: Number,
            default: 0,
            min: 0
        },
        minBookingAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        maxDiscountAmount: {
            type: Number,
            default: null, // null means no cap, applicable for percentage discounts
            min: 0
        },
        applicableRoomTypes: {
            type: [String],
            default: [] // Empty array means applicable to all room types
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Compound indexes for efficient querying
promoCodeSchema.index({ validFrom: 1, validUntil: 1 });
promoCodeSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

// Virtual to check if promo code is currently valid
promoCodeSchema.virtual('isCurrentlyValid').get(function () {
    const now = new Date();
    return this.isActive &&
        this.validFrom <= now &&
        this.validUntil >= now &&
        (this.usageLimit === null || this.usedCount < this.usageLimit);
});

// Method to check if promo can be applied to a booking
promoCodeSchema.methods.canApplyToBooking = function (bookingAmount, roomType) {
    const now = new Date();

    // Check if active
    if (!this.isActive) {
        return { valid: false, reason: 'Promo code is not active' };
    }

    // Check date validity
    if (now < this.validFrom) {
        return { valid: false, reason: 'Promo code is not yet valid' };
    }
    if (now > this.validUntil) {
        return { valid: false, reason: 'Promo code has expired' };
    }

    // Check usage limit
    if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
        return { valid: false, reason: 'Promo code usage limit reached' };
    }

    // Check minimum booking amount
    if (bookingAmount < this.minBookingAmount) {
        return {
            valid: false,
            reason: `Minimum booking amount of ₹${this.minBookingAmount} required`
        };
    }

    // Check room type applicability
    if (this.applicableRoomTypes.length > 0) {
        const normalizedRoomType = (roomType || '').toLowerCase().trim();
        const isApplicable = this.applicableRoomTypes.some(type =>
            normalizedRoomType.includes(type.toLowerCase().trim())
        );

        if (!isApplicable) {
            return {
                valid: false,
                reason: 'Promo code not applicable to this room type'
            };
        }
    }

    return { valid: true };
};

// Method to calculate discount amount
promoCodeSchema.methods.calculateDiscount = function (bookingAmount) {
    let discountAmount = 0;

    if (this.discountType === 'percentage') {
        discountAmount = (bookingAmount * this.discountValue) / 100;

        // Apply max discount cap if set
        if (this.maxDiscountAmount !== null && discountAmount > this.maxDiscountAmount) {
            discountAmount = this.maxDiscountAmount;
        }
    } else {
        // Fixed discount
        discountAmount = this.discountValue;

        // Ensure discount doesn't exceed booking amount
        if (discountAmount > bookingAmount) {
            discountAmount = bookingAmount;
        }
    }

    return Math.round(discountAmount * 100) / 100; // Round to 2 decimal places
};

const PromoCode = mongoose.models.PromoCode || mongoose.model('PromoCode', promoCodeSchema);

export default PromoCode;
