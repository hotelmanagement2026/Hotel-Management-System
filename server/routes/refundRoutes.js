import express from 'express';
import {
    createRefundRequest,
    getAllRefunds,
    getUserRefunds,
    updateRefundStatus
} from '../controllers/refundControllers.js';
import userAuth from '../middleware/userAuth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// User Routes
router.post('/request', userAuth, createRefundRequest);
router.get('/user/:userId', userAuth, getUserRefunds);

// Admin Routes
router.get('/', userAuth, adminAuth, getAllRefunds);
router.put('/:id/status', userAuth, adminAuth, updateRefundStatus);

export default router;
