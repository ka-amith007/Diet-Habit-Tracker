import Food from '../models/Food.js';
import multer from 'multer';
import path from 'path';

// Configure multer for food image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `food-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

export const uploadFoodImage = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images only!');
        }
    }
});

// @desc    Get all foods
// @route   GET /api/foods
// @access  Private
export const getFoods = async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = {};

        // Include default foods and user's custom foods
        query.$or = [
            { isCustom: false },
            { userId: req.user._id }
        ];

        if (category) {
            query.category = category;
        }

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const foods = await Food.find(query).sort({ name: 1 });
        res.json(foods);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add custom food
// @route   POST /api/foods
// @access  Private
export const addFood = async (req, res) => {
    try {
        const { name, category, calories, protein, carbs, fats, fiber } = req.body;

        const food = await Food.create({
            name,
            category,
            calories,
            protein,
            carbs,
            fats,
            fiber,
            userId: req.user._id,
            isCustom: true
        });

        res.status(201).json(food);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Search foods
// @route   GET /api/foods/search
// @access  Private
export const searchFoods = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.json([]);
        }

        const foods = await Food.find({
            name: { $regex: q, $options: 'i' },
            $or: [
                { isCustom: false },
                { userId: req.user._id }
            ]
        }).limit(20);

        res.json(foods);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Analyze food image with AI (Mock implementation)
// @route   POST /api/foods/analyze-image
// @access  Private
export const analyzeImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        // Mock AI response - In production, integrate with real AI service
        const mockFoods = [
            { name: 'Grilled Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 3.6, confidence: 92 },
            { name: 'Brown Rice', calories: 112, protein: 2.6, carbs: 24, fats: 0.9, confidence: 88 },
            { name: 'Caesar Salad', calories: 184, protein: 7, carbs: 10, fats: 14, confidence: 85 },
            { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, confidence: 95 },
            { name: 'Scrambled Eggs', calories: 148, protein: 10, carbs: 1.2, fats: 11, confidence: 90 },
            { name: 'Oatmeal', calories: 68, protein: 2.4, carbs: 12, fats: 1.4, confidence: 87 }
        ];

        // Randomly select a food item
        const detected = mockFoods[Math.floor(Math.random() * mockFoods.length)];

        res.json({
            success: true,
            detected: {
                name: detected.name,
                calories: detected.calories,
                protein: detected.protein,
                carbs: detected.carbs,
                fats: detected.fats,
                confidence: detected.confidence,
                quantity: 100, // Default 100g
                unit: 'grams'
            },
            imageUrl: `/uploads/${req.file.filename}`,
            message: 'Food detected successfully (Mock AI)'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
