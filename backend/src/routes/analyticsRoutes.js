import express from 'express';
import { getDailySummary, getWeeklySummary, getMonthlySummary, getMacroBreakdown, exportPDF } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/daily', protect, getDailySummary);
router.get('/weekly', protect, getWeeklySummary);
router.get('/monthly', protect, getMonthlySummary);
router.get('/macros', protect, getMacroBreakdown);
router.get('/export-pdf', protect, exportPDF);

export default router;
