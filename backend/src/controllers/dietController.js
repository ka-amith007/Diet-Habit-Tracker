import DietEntry from '../models/DietEntry.js';
import Food from '../models/Food.js';

// @desc    Get diet entries
// @route   GET /api/diet/entries
// @access  Private
export const getDietEntries = async (req, res) => {
    try {
        const { startDate, endDate, category } = req.query;
        let query = { userId: req.user._id };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (category) {
            query.category = category;
        }

        const entries = await DietEntry.find(query)
            .populate('foodId', 'name')
            .sort({ date: -1, category: 1 });

        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add diet entry
// @route   POST /api/diet/entries
// @access  Private
export const addDietEntry = async (req, res) => {
    try {
        const { foodId, foodName, date, category, quantity, unit, photoUrl, aiDetected, confidence } = req.body;

        // Get food details
        const food = await Food.findById(foodId);
        if (!food) {
            return res.status(404).json({ message: 'Food not found' });
        }

        // Calculate nutrition based on quantity
        const multiplier = quantity / 100; // Nutrition is per 100g
        const calories = Math.round(food.calories * multiplier);
        const protein = Math.round(food.protein * multiplier * 10) / 10;
        const carbs = Math.round(food.carbs * multiplier * 10) / 10;
        const fats = Math.round(food.fats * multiplier * 10) / 10;

        const entry = await DietEntry.create({
            userId: req.user._id,
            foodId,
            foodName: foodName || food.name,
            date: new Date(date),
            category,
            quantity,
            unit: unit || 'grams',
            calories,
            protein,
            carbs,
            fats,
            photoUrl,
            aiDetected: aiDetected || false,
            confidence
        });

        res.status(201).json(entry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update diet entry
// @route   PUT /api/diet/entries/:id
// @access  Private
export const updateDietEntry = async (req, res) => {
    try {
        const entry = await DietEntry.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        // Update fields
        if (req.body.quantity) {
            const food = await Food.findById(entry.foodId);
            const multiplier = req.body.quantity / 100;
            entry.quantity = req.body.quantity;
            entry.calories = Math.round(food.calories * multiplier);
            entry.protein = Math.round(food.protein * multiplier * 10) / 10;
            entry.carbs = Math.round(food.carbs * multiplier * 10) / 10;
            entry.fats = Math.round(food.fats * multiplier * 10) / 10;
        }

        if (req.body.category) entry.category = req.body.category;
        if (req.body.completed !== undefined) entry.completed = req.body.completed;

        await entry.save();
        res.json(entry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete diet entry
// @route   DELETE /api/diet/entries/:id
// @access  Private
export const deleteDietEntry = async (req, res) => {
    try {
        const entry = await DietEntry.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        await entry.deleteOne();
        res.json({ message: 'Entry removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle diet entry completion
// @route   PATCH /api/diet/entries/:id/toggle
// @access  Private
export const toggleCompletion = async (req, res) => {
    try {
        const entry = await DietEntry.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        entry.completed = !entry.completed;
        await entry.save();

        res.json(entry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
