import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId; // Password required only if not using Google OAuth
        },
        minlength: 6,
        select: false
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    profilePhoto: {
        type: String,
        default: ''
    },
    age: {
        type: Number,
        min: 1,
        max: 120
    },
    height: {
        type: Number, // in cm
        min: 50,
        max: 300
    },
    weight: {
        type: Number, // in kg
        min: 20,
        max: 500
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    goal: {
        type: String,
        enum: ['weight_loss', 'muscle_gain', 'maintenance'],
        default: 'maintenance'
    },
    dietPreference: {
        type: String,
        enum: ['vegetarian', 'non_vegetarian', 'vegan'],
        default: 'non_vegetarian'
    },
    activityLevel: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
        default: 'moderate'
    },
    calorieTarget: {
        type: Number,
        default: 2000
    },
    proteinTarget: {
        type: Number,
        default: 150
    },
    carbsTarget: {
        type: Number,
        default: 200
    },
    fatsTarget: {
        type: Number,
        default: 65
    },
    waterTarget: {
        type: Number,
        default: 8 // glasses
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    if (this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Calculate calorie target based on user data
userSchema.methods.calculateCalorieTarget = function () {
    if (!this.age || !this.height || !this.weight || !this.gender) {
        return 2000; // Default
    }

    // Mifflin-St Jeor Equation
    let bmr;
    if (this.gender === 'male') {
        bmr = 10 * this.weight + 6.25 * this.height - 5 * this.age + 5;
    } else {
        bmr = 10 * this.weight + 6.25 * this.height - 5 * this.age - 161;
    }

    // Activity multiplier
    const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
    };

    let tdee = bmr * (activityMultipliers[this.activityLevel] || 1.55);

    // Adjust based on goal
    if (this.goal === 'weight_loss') {
        tdee -= 500; // 500 calorie deficit
    } else if (this.goal === 'muscle_gain') {
        tdee += 300; // 300 calorie surplus
    }

    return Math.round(tdee);
};

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
