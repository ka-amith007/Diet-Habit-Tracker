import mongoose from 'mongoose';

const dietEntrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food',
        required: true
    },
    foodName: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    category: {
        type: String,
        enum: ['breakfast', 'lunch', 'snacks', 'dinner'],
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    unit: {
        type: String,
        enum: ['grams', 'pieces', 'ml', 'cups'],
        default: 'grams'
    },
    // Calculated nutrition based on quantity
    calories: {
        type: Number,
        required: true
    },
    protein: {
        type: Number,
        required: true
    },
    carbs: {
        type: Number,
        required: true
    },
    fats: {
        type: Number,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    photoUrl: {
        type: String,
        default: ''
    },
    aiDetected: {
        type: Boolean,
        default: false
    },
    confidence: {
        type: Number,
        min: 0,
        max: 100
    }
}, {
    timestamps: true
});

// Index for faster queries
dietEntrySchema.index({ userId: 1, date: 1 });

const DietEntry = mongoose.model('DietEntry', dietEntrySchema);

export default DietEntry;
