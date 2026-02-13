import express from 'express';
import { getPendingReviews, approveReview, rejectReview } from '../controllers/adminReviewControllers.js';
import userAuth from '../middleware/userAuth.js';
import adminAuth from '../middleware/adminAuth.js';

const adminReviewRoutes = express.Router();

// All routes require authentication and admin privileges
adminReviewRoutes.get('/pending', userAuth, adminAuth, getPendingReviews);
adminReviewRoutes.put('/approve/:id', userAuth, adminAuth, approveReview);
adminReviewRoutes.put('/reject/:id', userAuth, adminAuth, rejectReview);

export default adminReviewRoutes;
