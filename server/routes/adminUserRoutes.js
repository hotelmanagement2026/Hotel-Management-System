import express from 'express';
import userAuth from '../middleware/userAuth.js';
import adminAuth from '../middleware/adminAuth.js';
import { getAllUsers, changeUserRole, deleteUser } from '../controllers/adminUserControllers.js';

const router = express.Router();

// All routes require authentication and admin role
router.get('/users', userAuth, adminAuth, getAllUsers);
router.put('/users/:id/role', userAuth, adminAuth, changeUserRole);
router.delete('/users/:id', userAuth, adminAuth, deleteUser);

export default router;
