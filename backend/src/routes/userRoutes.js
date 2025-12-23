import express from 'express';
import { getProfile, updateProfile, uploadProfilePhoto, updateSettings, upload } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/profile/photo', protect, upload.single('photo'), uploadProfilePhoto);
router.put('/settings', protect, updateSettings);

export default router;
