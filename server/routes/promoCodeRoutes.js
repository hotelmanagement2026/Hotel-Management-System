import express from 'express';
import userAuth from '../middleware/userAuth.js';
import adminAuth from '../middleware/adminAuth.js';
import {
    validatePromoCode,
    createPromoCode,
    getAllPromoCodes,
    updatePromoCode,
    deletePromoCode
} from '../controllers/promoCodeControllers.js';

const router = express.Router();

// Public route (requires user authentication)
router.post('/validate', userAuth, validatePromoCode);

// Admin routes (requires both user and admin authentication)
router.post('/', userAuth, adminAuth, createPromoCode);
router.get('/', userAuth, adminAuth, getAllPromoCodes);
router.put('/:id', userAuth, adminAuth, updatePromoCode);
router.delete('/:id', userAuth, adminAuth, deletePromoCode);

export default router;
