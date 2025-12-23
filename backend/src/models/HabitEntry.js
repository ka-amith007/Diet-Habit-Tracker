import mongoose from 'mongoose';

const habitEntrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    habitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Habit',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound index for unique entries per habit per day
habitEntrySchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });

const HabitEntry = mongoose.model('HabitEntry', habitEntrySchema);

export default HabitEntry;
