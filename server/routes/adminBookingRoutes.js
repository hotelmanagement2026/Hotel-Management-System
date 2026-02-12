import express from 'express';
import userAuth from '../middleware/userAuth.js';
import adminAuth from '../middleware/adminAuth.js';
import { getAllBookings, cancelBooking, completeBooking } from '../controllers/adminBookingControllers.js';
import { checkInBooking, checkOutBooking } from '../controllers/checkInOutControllers.js';

const router = express.Router();

router.get('/bookings', userAuth, adminAuth, getAllBookings);
router.put('/bookings/:id/cancel', userAuth, adminAuth, cancelBooking);
router.put('/bookings/:id/complete', userAuth, adminAuth, completeBooking);
router.put('/checkin/:bookingId', userAuth, adminAuth, checkInBooking);
router.put('/checkout/:bookingId', userAuth, adminAuth, checkOutBooking);

export default router;
