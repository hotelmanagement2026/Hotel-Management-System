import express from 'express';
import {
    createInvoice,
    getInvoiceById,
    getUserInvoices,
    getAllInvoices,
    downloadInvoicePDF
} from '../controllers/invoiceControllers.js';
import userAuth from '../middleware/userAuth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Public / User Routes
router.post('/generate/:bookingId', userAuth, createInvoice);
router.get('/user/:userId', userAuth, getUserInvoices);
router.get('/:id', userAuth, getInvoiceById);
router.get('/:id/download', userAuth, downloadInvoicePDF);

// Admin Routes
router.get('/', userAuth, adminAuth, getAllInvoices);

export default router;
