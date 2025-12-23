import express from 'express';
import {
    getHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    getHabitEntries,
    toggleHabitCompletion,
    getHabitStreak
} from '../controllers/habitController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getHabits);
router.post('/', protect, createHabit);
router.put('/:id', protect, updateHabit);
router.delete('/:id', protect, deleteHabit);
router.get('/:id/entries', protect, getHabitEntries);
router.patch('/:id/entries/:date/toggle', protect, toggleHabitCompletion);
router.get('/:id/streak', protect, getHabitStreak);

export default router;
