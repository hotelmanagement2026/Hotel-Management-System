import SeasonalDiscount from '../models/SeasonalDiscount.js';

// Get active seasonal discounts (Public)
export const getActiveSeasonalDiscounts = async (req, res) => {
    try {
        const { checkInDate, checkOutDate, roomType } = req.query;

        if (!checkInDate || !checkOutDate) {
            return res.status(400).json({
                success: false,
                message: 'Check-in and check-out dates are required'
            });
        }

        // Find the best applicable discount
        const bestDiscount = await SeasonalDiscount.findBestDiscount(
            checkInDate,
            checkOutDate,
            roomType
        );

        if (!bestDiscount) {
            return res.status(200).json({
                success: true,
                message: 'No applicable seasonal discounts found',
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Seasonal discount found',
            data: {
                id: bestDiscount._id,
                name: bestDiscount.name,
                description: bestDiscount.description,
                discountPercentage: bestDiscount.discountPercentage,
                priority: bestDiscount.priority
            }
        });
    } catch (error) {
        console.error('Get active seasonal discounts error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch seasonal discounts'
        });
    }
};

// Create seasonal discount (Admin only)
export const createSeasonalDiscount = async (req, res) => {
    try {
        const {
            name,
            description,
            discountPercentage,
            startDate,
            endDate,
            priority,
            applicableRoomTypes,
            daysOfWeek,
            isActive
        } = req.body;

        // Validation
        if (!name || discountPercentage === undefined || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Validate dates
        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }

        // Validate discount percentage
        if (discountPercentage < 0 || discountPercentage > 100) {
            return res.status(400).json({
                success: false,
                message: 'Discount percentage must be between 0 and 100'
            });
        }

        const seasonalDiscount = new SeasonalDiscount({
            name,
            description,
            discountPercentage,
            startDate,
            endDate,
            priority: priority || 0,
            applicableRoomTypes: applicableRoomTypes || [],
            daysOfWeek: daysOfWeek || [],
            isActive: isActive !== undefined ? isActive : true,
            createdBy: req.userId
        });

        await seasonalDiscount.save();

        return res.status(201).json({
            success: true,
            message: 'Seasonal discount created successfully',
            data: seasonalDiscount
        });
    } catch (error) {
        console.error('Create seasonal discount error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create seasonal discount'
        });
    }
};

// Get all seasonal discounts (Admin only)
export const getAllSeasonalDiscounts = async (req, res) => {
    try {
        const { isActive, search } = req.query;

        let query = {};

        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const seasonalDiscounts = await SeasonalDiscount.find(query)
            .populate('createdBy', 'name email')
            .sort({ priority: -1, createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: seasonalDiscounts
        });
    } catch (error) {
        console.error('Get all seasonal discounts error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch seasonal discounts'
        });
    }
};

// Update seasonal discount (Admin only)
export const updateSeasonalDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Don't allow changing createdBy
        delete updates.createdBy;

        // Validate dates if provided
        if (updates.startDate && updates.endDate) {
            if (new Date(updates.startDate) >= new Date(updates.endDate)) {
                return res.status(400).json({
                    success: false,
                    message: 'End date must be after start date'
                });
            }
        }

        // Validate discount percentage if provided
        if (updates.discountPercentage !== undefined) {
            if (updates.discountPercentage < 0 || updates.discountPercentage > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Discount percentage must be between 0 and 100'
                });
            }
        }

        const seasonalDiscount = await SeasonalDiscount.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!seasonalDiscount) {
            return res.status(404).json({
                success: false,
                message: 'Seasonal discount not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Seasonal discount updated successfully',
            data: seasonalDiscount
        });
    } catch (error) {
        console.error('Update seasonal discount error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update seasonal discount'
        });
    }
};

// Delete seasonal discount (Admin only)
export const deleteSeasonalDiscount = async (req, res) => {
    try {
        const { id } = req.params;

        const seasonalDiscount = await SeasonalDiscount.findByIdAndDelete(id);

        if (!seasonalDiscount) {
            return res.status(404).json({
                success: false,
                message: 'Seasonal discount not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Seasonal discount deleted successfully'
        });
    } catch (error) {
        console.error('Delete seasonal discount error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete seasonal discount'
        });
    }
};
