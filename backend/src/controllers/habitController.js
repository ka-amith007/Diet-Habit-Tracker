import Habit from '../models/Habit.js';
import HabitEntry from '../models/HabitEntry.js';

// @desc    Get user habits
// @route   GET /api/habits
// @access  Private
export const getHabits = async (req, res) => {
    try {
        const habits = await Habit.find({ userId: req.user._id, active: true })
            .sort({ createdAt: 1 });
        res.json(habits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create habit
// @route   POST /api/habits
// @access  Private
export const createHabit = async (req, res) => {
    try {
        const { name, description, icon, color } = req.body;

        const habit = await Habit.create({
            userId: req.user._id,
            name,
            description,
            icon: icon || '✓',
            color: color || '#3b82f6'
        });

        res.status(201).json(habit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update habit
// @route   PUT /api/habits/:id
// @access  Private
export const updateHabit = async (req, res) => {
    try {
        const habit = await Habit.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        habit.name = req.body.name || habit.name;
        habit.description = req.body.description || habit.description;
        habit.icon = req.body.icon || habit.icon;
        habit.color = req.body.color || habit.color;

        await habit.save();
        res.json(habit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete habit
// @route   DELETE /api/habits/:id
// @access  Private
export const deleteHabit = async (req, res) => {
    try {
        const habit = await Habit.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        habit.active = false;
        await habit.save();

        res.json({ message: 'Habit deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get habit entries
// @route   GET /api/habits/:id/entries
// @access  Private
export const getHabitEntries = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = {
            userId: req.user._id,
            habitId: req.params.id
        };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const entries = await HabitEntry.find(query).sort({ date: 1 });
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle habit completion
// @route   PATCH /api/habits/:id/entries/:date/toggle
// @access  Private
export const toggleHabitCompletion = async (req, res) => {
    try {
        const { id, date } = req.params;
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        // Find existing entry
        let entry = await HabitEntry.findOne({
            userId: req.user._id,
            habitId: id,
            date: targetDate
        });

        if (entry) {
            // Toggle completion
            entry.completed = !entry.completed;
            await entry.save();
        } else {
            // Create new entry
            entry = await HabitEntry.create({
                userId: req.user._id,
                habitId: id,
                date: targetDate,
                completed: true
            });
        }

        res.json(entry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get habit streak
// @route   GET /api/habits/:id/streak
// @access  Private
export const getHabitStreak = async (req, res) => {
    try {
        const entries = await HabitEntry.find({
            userId: req.user._id,
            habitId: req.params.id,
            completed: true
        }).sort({ date: -1 });

        let currentStreak = 0;
        let bestStreak = 0;
        let tempStreak = 0;

        if (entries.length === 0) {
            return res.json({ currentStreak: 0, bestStreak: 0 });
        }

        // Calculate current streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let checkDate = new Date(today);

        for (let i = 0; i < entries.length; i++) {
            const entryDate = new Date(entries[i].date);
            entryDate.setHours(0, 0, 0, 0);

            if (entryDate.getTime() === checkDate.getTime()) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        // Calculate best streak
        for (let i = 0; i < entries.length; i++) {
            if (i === 0) {
                tempStreak = 1;
            } else {
                const prevDate = new Date(entries[i - 1].date);
                const currDate = new Date(entries[i].date);
                const diffDays = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    tempStreak++;
                } else {
                    bestStreak = Math.max(bestStreak, tempStreak);
                    tempStreak = 1;
                }
            }
        }
        bestStreak = Math.max(bestStreak, tempStreak);

        res.json({ currentStreak, bestStreak });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
