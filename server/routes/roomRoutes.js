import express from 'express';
import userAuth from '../middleware/userAuth.js';
import adminAuth from '../middleware/adminAuth.js';
import {
    createRoom,
    updateRoom,
    deleteRoom,
    getAllRoomsAdmin,
    getAllRooms,
    getRoomById
} from '../controllers/roomControllers.js';

const router = express.Router();

// Public routes
router.get('/', getAllRooms);
router.get('/:id', getRoomById);

// Admin routes (protected)
router.post('/', userAuth, adminAuth, createRoom);
router.put('/:id', userAuth, adminAuth, updateRoom);
router.delete('/:id', userAuth, adminAuth, deleteRoom);
router.get('/admin/all', userAuth, adminAuth, getAllRoomsAdmin);

export default router;
