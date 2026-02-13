import Review from '../models/Review.js';
import userModel from '../models/userModel.js';
import Room from '../models/Room.js';

// Get all pending reviews (admin only)
export const getPendingReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ status: 'pending' })
            .populate('user', 'name email')
            .populate('room', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: reviews
        });

    } catch (error) {
        console.error('Get pending reviews error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch pending reviews.'
        });
    }
};

// Approve a review (admin only)
export const approveReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findByIdAndUpdate(
            id,
            { status: 'approved' },
            { new: true }
        )
            .populate('user', 'name')
            .populate('room', 'name');

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Review approved successfully.',
            data: review
        });

    } catch (error) {
        console.error('Approve review error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to approve review.'
        });
    }
};

// Reject a review (admin only)
export const rejectReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findByIdAndUpdate(
            id,
            { status: 'rejected' },
            { new: true }
        )
            .populate('user', 'name')
            .populate('room', 'name');

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Review rejected successfully.',
            data: review
        });

    } catch (error) {
        console.error('Reject review error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to reject review.'
        });
    }
};
