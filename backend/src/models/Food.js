import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['breakfast', 'lunch', 'snacks', 'dinner', 'other'],
        default: 'other'
    },
    // Nutrition per 100g
    calories: {
        type: Number,
        required: true,
        min: 0
    },
    protein: {
        type: Number,
        required: true,
        min: 0
    },
    carbs: {
        type: Number,
        required: true,
        min: 0
    },
    fats: {
        type: Number,
        required: true,
        min: 0
    },
    fiber: {
        type: Number,
        default: 0,
        min: 0
    },
    // Custom food created by user
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    isCustom: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Food = mongoose.model('Food', foodSchema);

export default Food;
