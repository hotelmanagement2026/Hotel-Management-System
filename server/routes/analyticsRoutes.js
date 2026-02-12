import express from 'express';
import userAuth from '../middleware/userAuth.js';
import adminAuth from '../middleware/adminAuth.js';
import { getDashboardData, getBookingReports, getOccupancyRate, getTopRooms, getPeakSeason } from '../controllers/analyticsControllers.js';

const router = express.Router();

// Protected by both userAuth (to get userId) and adminAuth (to check role)
router.get('/dashboard', userAuth, adminAuth, getDashboardData);
router.get('/reports', userAuth, adminAuth, getBookingReports);
router.get('/occupancy', userAuth, adminAuth, getOccupancyRate);
router.get('/top-rooms', userAuth, adminAuth, getTopRooms);
router.get('/peak-season', userAuth, adminAuth, getPeakSeason);

export default router;
