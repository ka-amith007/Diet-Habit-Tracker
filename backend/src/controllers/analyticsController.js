import DietEntry from '../models/DietEntry.js';
import HabitEntry from '../models/HabitEntry.js';
import User from '../models/User.js';
import PDFDocument from 'pdfkit';

// @desc    Get daily nutrition summary
// @route   GET /api/analytics/daily
// @access  Private
export const getDailySummary = async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const entries = await DietEntry.find({
            userId: req.user._id,
            date: {
                $gte: targetDate,
                $lt: nextDay
            },
            completed: true
        });

        const summary = entries.reduce((acc, entry) => {
            acc.calories += entry.calories;
            acc.protein += entry.protein;
            acc.carbs += entry.carbs;
            acc.fats += entry.fats;
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

        const user = await User.findById(req.user._id);

        res.json({
            date: targetDate,
            consumed: summary,
            targets: {
                calories: user.calorieTarget,
                protein: user.proteinTarget,
                carbs: user.carbsTarget,
                fats: user.fatsTarget
            },
            remaining: {
                calories: user.calorieTarget - summary.calories,
                protein: user.proteinTarget - summary.protein,
                carbs: user.carbsTarget - summary.carbs,
                fats: user.fatsTarget - summary.fats
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get weekly progress
// @route   GET /api/analytics/weekly
// @access  Private
export const getWeeklySummary = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const entries = await DietEntry.find({
            userId: req.user._id,
            date: {
                $gte: weekAgo,
                $lte: today
            },
            completed: true
        });

        // Group by date
        const dailyData = {};
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekAgo);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            dailyData[dateStr] = { calories: 0, protein: 0, carbs: 0, fats: 0 };
        }

        entries.forEach(entry => {
            const dateStr = entry.date.toISOString().split('T')[0];
            if (dailyData[dateStr]) {
                dailyData[dateStr].calories += entry.calories;
                dailyData[dateStr].protein += entry.protein;
                dailyData[dateStr].carbs += entry.carbs;
                dailyData[dateStr].fats += entry.fats;
            }
        });

        res.json(dailyData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get monthly statistics
// @route   GET /api/analytics/monthly
// @access  Private
export const getMonthlySummary = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 30);

        const entries = await DietEntry.find({
            userId: req.user._id,
            date: {
                $gte: monthAgo,
                $lte: today
            },
            completed: true
        });

        const totalDays = 30;
        const summary = entries.reduce((acc, entry) => {
            acc.calories += entry.calories;
            acc.protein += entry.protein;
            acc.carbs += entry.carbs;
            acc.fats += entry.fats;
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

        const avgDaily = {
            calories: Math.round(summary.calories / totalDays),
            protein: Math.round(summary.protein / totalDays),
            carbs: Math.round(summary.carbs / totalDays),
            fats: Math.round(summary.fats / totalDays)
        };

        res.json({
            total: summary,
            average: avgDaily,
            days: totalDays
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get macro breakdown
// @route   GET /api/analytics/macros
// @access  Private
export const getMacroBreakdown = async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const entries = await DietEntry.find({
            userId: req.user._id,
            date: {
                $gte: targetDate,
                $lt: nextDay
            },
            completed: true
        });

        const totals = entries.reduce((acc, entry) => {
            acc.protein += entry.protein;
            acc.carbs += entry.carbs;
            acc.fats += entry.fats;
            return acc;
        }, { protein: 0, carbs: 0, fats: 0 });

        // Calculate calories from macros
        const proteinCal = totals.protein * 4;
        const carbsCal = totals.carbs * 4;
        const fatsCal = totals.fats * 9;
        const totalCal = proteinCal + carbsCal + fatsCal;

        const percentages = {
            protein: totalCal > 0 ? Math.round((proteinCal / totalCal) * 100) : 0,
            carbs: totalCal > 0 ? Math.round((carbsCal / totalCal) * 100) : 0,
            fats: totalCal > 0 ? Math.round((fatsCal / totalCal) * 100) : 0
        };

        res.json({
            grams: totals,
            calories: {
                protein: proteinCal,
                carbs: carbsCal,
                fats: fatsCal,
                total: totalCal
            },
            percentages
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Export weekly report as PDF
// @route   GET /api/analytics/export-pdf
// @access  Private
export const exportPDF = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const entries = await DietEntry.find({
            userId: req.user._id,
            date: { $gte: weekAgo, $lte: today },
            completed: true
        });

        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=diet-report.pdf');

        doc.pipe(res);

        // Title
        doc.fontSize(20).text('Weekly Diet Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`User: ${user.name}`, { align: 'center' });
        doc.text(`Period: ${weekAgo.toDateString()} - ${today.toDateString()}`, { align: 'center' });
        doc.moveDown(2);

        // Summary
        const summary = entries.reduce((acc, entry) => {
            acc.calories += entry.calories;
            acc.protein += entry.protein;
            acc.carbs += entry.carbs;
            acc.fats += entry.fats;
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

        doc.fontSize(14).text('Weekly Summary:', { underline: true });
        doc.moveDown();
        doc.fontSize(11);
        doc.text(`Total Calories: ${summary.calories} kcal`);
        doc.text(`Total Protein: ${summary.protein}g`);
        doc.text(`Total Carbs: ${summary.carbs}g`);
        doc.text(`Total Fats: ${summary.fats}g`);
        doc.moveDown();
        doc.text(`Average Daily Calories: ${Math.round(summary.calories / 7)} kcal`);

        doc.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
