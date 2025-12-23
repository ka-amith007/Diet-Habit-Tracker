import WaterIntake from '../models/WaterIntake.js';

// @desc    Log water intake
// @route   POST /api/water
// @access  Private
export const logWater = async (req, res) => {
    try {
        const { date, glasses } = req.body;
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        let waterLog = await WaterIntake.findOne({
            userId: req.user._id,
            date: targetDate
        });

        if (waterLog) {
            waterLog.glasses += glasses || 1;
            await waterLog.save();
        } else {
            waterLog = await WaterIntake.create({
                userId: req.user._id,
                date: targetDate,
                glasses: glasses || 1,
                target: req.user.waterTarget || 8
            });
        }

        res.json(waterLog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get today's water intake
// @route   GET /api/water/today
// @access  Private
export const getTodayWater = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let waterLog = await WaterIntake.findOne({
            userId: req.user._id,
            date: today
        });

        if (!waterLog) {
            waterLog = {
                glasses: 0,
                target: req.user.waterTarget || 8,
                date: today
            };
        }

        res.json(waterLog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get water intake history
// @route   GET /api/water/history
// @access  Private
export const getWaterHistory = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = { userId: req.user._id };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const history = await WaterIntake.find(query).sort({ date: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update water intake
// @route   PUT /api/water/:id
// @access  Private
export const updateWater = async (req, res) => {
    try {
        const waterLog = await WaterIntake.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!waterLog) {
            return res.status(404).json({ message: 'Water log not found' });
        }

        waterLog.glasses = req.body.glasses;
        await waterLog.save();

        res.json(waterLog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
