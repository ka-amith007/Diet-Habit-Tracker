import express from 'express';
import { getDietEntries, addDietEntry, updateDietEntry, deleteDietEntry, toggleCompletion } from '../controllers/dietController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/entries', protect, getDietEntries);
router.post('/entries', protect, addDietEntry);
router.put('/entries/:id', protect, updateDietEntry);
router.delete('/entries/:id', protect, deleteDietEntry);
router.patch('/entries/:id/toggle', protect, toggleCompletion);

export default router;
