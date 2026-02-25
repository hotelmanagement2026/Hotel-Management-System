import express from 'express';
import userAuth from '../middleware/userAuth.js';
import adminAuth from '../middleware/adminAuth.js';
import {
    getActiveSeasonalDiscounts,
    createSeasonalDiscount,
    getAllSeasonalDiscounts,
    updateSeasonalDiscount,
    deleteSeasonalDiscount
} from '../controllers/seasonalDiscountControllers.js';

const router = express.Router();

// Public route (no authentication required)
router.get('/active', getActiveSeasonalDiscounts);

// Admin routes (requires both user and admin authentication)
router.post('/', userAuth, adminAuth, createSeasonalDiscount);
router.get('/', userAuth, adminAuth, getAllSeasonalDiscounts);
router.put('/:id', userAuth, adminAuth, updateSeasonalDiscount);
router.delete('/:id', userAuth, adminAuth, deleteSeasonalDiscount);

export default router;
