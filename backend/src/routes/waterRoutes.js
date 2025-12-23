import express from 'express';
import { logWater, getTodayWater, getWaterHistory, updateWater } from '../controllers/waterController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, logWater);
router.get('/today', protect, getTodayWater);
router.get('/history', protect, getWaterHistory);
router.put('/:id', protect, updateWater);

export default router;
