import express from 'express';
import { getFoods, addFood, searchFoods, analyzeImage, uploadFoodImage } from '../controllers/foodController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getFoods);
router.post('/', protect, addFood);
router.get('/search', protect, searchFoods);
router.post('/analyze-image', protect, uploadFoodImage.single('image'), analyzeImage);

export default router;
