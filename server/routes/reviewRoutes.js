import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { submitReview, getPublicReviews, checkReviewEligibility } from '../controllers/reviewControllers.js';

const reviewRouter = express.Router();

// Protected routes - require authentication
reviewRouter.get('/eligibility/:roomId', userAuth, checkReviewEligibility);
reviewRouter.post('/', userAuth, submitReview);

// Public route - get approved reviews for a room
reviewRouter.get('/:roomId', getPublicReviews);

export default reviewRouter;
