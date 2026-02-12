import express from 'express';
import userAuth from '../middleware/userAuth.js';
import {
    createOrder,
    verifyPayment,
    getTransactions,
    refundPayment,
    cancelBooking
} from '../controllers/paymentControllers.js';

const router = express.Router();

router.post('/create-order', userAuth, createOrder);
router.post('/verify', userAuth, verifyPayment);
router.get('/transactions', userAuth, getTransactions);
router.post('/refund', userAuth, refundPayment);
router.post('/cancel-booking', userAuth, cancelBooking);

export default router;
