import User from '../models/User.js';
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `profile-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

export const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images only!');
        }
    }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.age = req.body.age || user.age;
            user.height = req.body.height || user.height;
            user.weight = req.body.weight || user.weight;
            user.gender = req.body.gender || user.gender;
            user.goal = req.body.goal || user.goal;
            user.dietPreference = req.body.dietPreference || user.dietPreference;
            user.activityLevel = req.body.activityLevel || user.activityLevel;

            // Recalculate calorie target
            user.calorieTarget = user.calculateCalorieTarget();

            // Calculate macro targets (example ratios)
            const totalCalories = user.calorieTarget;
            user.proteinTarget = Math.round((totalCalories * 0.3) / 4); // 30% protein, 4 cal/g
            user.carbsTarget = Math.round((totalCalories * 0.4) / 4); // 40% carbs, 4 cal/g
            user.fatsTarget = Math.round((totalCalories * 0.3) / 9); // 30% fats, 9 cal/g

            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload profile photo
// @route   POST /api/users/profile/photo
// @access  Private
export const uploadProfilePhoto = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.profilePhoto = `/uploads/${req.file.filename}`;
            await user.save();
            res.json({ profilePhoto: user.profilePhoto });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
export const updateSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.calorieTarget = req.body.calorieTarget || user.calorieTarget;
            user.proteinTarget = req.body.proteinTarget || user.proteinTarget;
            user.carbsTarget = req.body.carbsTarget || user.carbsTarget;
            user.fatsTarget = req.body.fatsTarget || user.fatsTarget;
            user.waterTarget = req.body.waterTarget || user.waterTarget;

            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
