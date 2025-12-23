import mongoose from 'mongoose';

const waterIntakeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    glasses: {
        type: Number,
        default: 0,
        min: 0
    },
    target: {
        type: Number,
        default: 8
    }
}, {
    timestamps: true
});

// Index for faster queries
waterIntakeSchema.index({ userId: 1, date: 1 }, { unique: true });

const WaterIntake = mongoose.model('WaterIntake', waterIntakeSchema);

export default WaterIntake;
