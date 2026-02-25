import mongoose from 'mongoose';

const seasonalDiscountSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        discountPercentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        startDate: {
            type: Date,
            required: true,
            index: true
        },
        endDate: {
            type: Date,
            required: true,
            index: true
        },
        priority: {
            type: Number,
            default: 0,
            index: true // Higher number = higher priority
        },
        applicableRoomTypes: {
            type: [String],
            default: [] // Empty array means applicable to all room types
        },
        daysOfWeek: {
            type: [Number],
            default: [], // Empty means all days, 0-6 for Sunday-Saturday
            validate: {
                validator: function (days) {
                    return days.every(day => day >= 0 && day <= 6);
                },
                message: 'Days of week must be between 0 (Sunday) and 6 (Saturday)'
            }
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
seasonalDiscountSchema.index({ startDate: 1, endDate: 1 });
seasonalDiscountSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
seasonalDiscountSchema.index({ priority: -1 }); // Descending for priority sorting

// Virtual to check if discount is currently active
seasonalDiscountSchema.virtual('isCurrentlyActive').get(function () {
    const now = new Date();
    return this.isActive && this.startDate <= now && this.endDate >= now;
});

// Method to check if discount applies to a specific date range and room type
seasonalDiscountSchema.methods.appliesTo = function (checkInDate, checkOutDate, roomType) {
    // Check if active
    if (!this.isActive) {
        return false;
    }

    // Check date overlap
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Discount applies if there's any overlap between booking dates and discount period
    if (checkOut < this.startDate || checkIn > this.endDate) {
        return false;
    }

    // Check room type applicability
    if (this.applicableRoomTypes.length > 0) {
        const normalizedRoomType = (roomType || '').toLowerCase().trim();
        const isApplicable = this.applicableRoomTypes.some(type =>
            normalizedRoomType.includes(type.toLowerCase().trim())
        );

        if (!isApplicable) {
            return false;
        }
    }

    // Check days of week if specified
    if (this.daysOfWeek.length > 0) {
        // Check if any day in the booking period matches the allowed days
        let currentDate = new Date(checkIn);
        let hasMatchingDay = false;

        while (currentDate <= checkOut) {
            const dayOfWeek = currentDate.getDay();
            if (this.daysOfWeek.includes(dayOfWeek)) {
                hasMatchingDay = true;
                break;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (!hasMatchingDay) {
            return false;
        }
    }

    return true;
};

// Method to calculate discount amount
seasonalDiscountSchema.methods.calculateDiscount = function (bookingAmount) {
    const discountAmount = (bookingAmount * this.discountPercentage) / 100;
    return Math.round(discountAmount * 100) / 100; // Round to 2 decimal places
};

// Static method to find the best applicable discount for a booking
seasonalDiscountSchema.statics.findBestDiscount = async function (checkInDate, checkOutDate, roomType) {
    const discounts = await this.find({
        isActive: true,
        startDate: { $lte: new Date(checkOutDate) },
        endDate: { $gte: new Date(checkInDate) }
    }).sort({ priority: -1 }); // Sort by priority descending

    // Find the first discount that applies (highest priority)
    for (const discount of discounts) {
        if (discount.appliesTo(checkInDate, checkOutDate, roomType)) {
            return discount;
        }
    }

    return null;
};

const SeasonalDiscount = mongoose.models.SeasonalDiscount || mongoose.model('SeasonalDiscount', seasonalDiscountSchema);

export default SeasonalDiscount;
