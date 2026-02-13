import Review from '../models/Review.js';
import Transaction from '../models/Transaction.js';
import userModel from '../models/userModel.js';
import Room from '../models/Room.js';

// Submit a review (user must have checked out)
export const submitReview = async (req, res) => {
    try {
        const { roomId, rating, comment } = req.body;
        const userId = req.userId;

        // Validate input
        if (!roomId || !rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Room ID, rating, and comment are required.'
            });
        }

        // Validate rating range
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5.'
            });
        }

        // Check if user has a checked-out booking for this room
        const checkedOutBooking = await Transaction.findOne({
            userId: userId,
            roomId: roomId,
            bookingStatus: 'checked_out'
        });

        if (!checkedOutBooking) {
            return res.status(403).json({
                success: false,
                message: 'You can only review after checkout.'
            });
        }

        // Check if user already reviewed this booking
        const existingReview = await Review.findOne({
            user: userId,
            booking: checkedOutBooking._id
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this booking.'
            });
        }

        // Create review
        const review = await Review.create({
            user: userId,
            room: roomId,
            booking: checkedOutBooking._id,
            rating: Number(rating),
            comment: comment.trim(),
            status: 'pending'
        });

        return res.status(201).json({
            success: true,
            message: 'Review submitted for admin approval.',
            data: review
        });

    } catch (error) {
        console.error('Submit review error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to submit review.'
        });
    }
};

// Get approved reviews for a room (public)
export const getPublicReviews = async (req, res) => {
    try {
        const { roomId } = req.params;

        if (!roomId) {
            return res.status(400).json({
                success: false,
                message: 'Room ID is required.'
            });
        }

        // Fetch only approved reviews
        const reviews = await Review.find({
            room: roomId,
            status: 'approved'
        })
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: reviews
        });

    } catch (error) {
        console.error('Get public reviews error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews.'
        });
    }
};

// Check if user is eligible to review a room
export const checkReviewEligibility = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.userId;

        if (!userId) {
            return res.status(200).json({
                success: true,
                canReview: false,
                hasReviewed: false,
                message: 'Please login to review.'
            });
        }

        // Check if user has a checked-out booking for this room
        const checkedOutBooking = await Transaction.findOne({
            userId: userId,
            roomId: roomId,
            bookingStatus: 'checked_out'
        });

        if (!checkedOutBooking) {
            return res.status(200).json({
                success: true,
                canReview: false,
                hasReviewed: false,
                message: 'You can only review after checkout.'
            });
        }

        // Check if user already reviewed this booking
        const existingReview = await Review.findOne({
            user: userId,
            booking: checkedOutBooking._id
        });

        if (existingReview) {
            return res.status(200).json({
                success: true,
                canReview: false,
                hasReviewed: true,
                reviewStatus: existingReview.status,
                message: 'You have already reviewed this room.'
            });
        }

        // User is eligible to review
        return res.status(200).json({
            success: true,
            canReview: true,
            hasReviewed: false,
            bookingId: checkedOutBooking._id,
            message: 'You can submit a review for this room.'
        });

    } catch (error) {
        console.error('Check review eligibility error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to check review eligibility.'
        });
    }
};

