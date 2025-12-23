import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Food from '../models/Food.js';
import User from '../models/User.js';

dotenv.config();

const sampleFoods = [
    // Breakfast items
    { name: 'Oatmeal', category: 'breakfast', calories: 68, protein: 2.4, carbs: 12, fats: 1.4, fiber: 1.7 },
    { name: 'Scrambled Eggs', category: 'breakfast', calories: 148, protein: 10, carbs: 1.2, fats: 11, fiber: 0 },
    { name: 'Whole Wheat Toast', category: 'breakfast', calories: 247, protein: 13, carbs: 41, fats: 3.4, fiber: 6 },
    { name: 'Greek Yogurt', category: 'breakfast', calories: 59, protein: 10, carbs: 3.6, fats: 0.4, fiber: 0 },
    { name: 'Banana', category: 'breakfast', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, fiber: 2.6 },
    { name: 'Avocado Toast', category: 'breakfast', calories: 160, protein: 2, carbs: 9, fats: 15, fiber: 7 },
    { name: 'Pancakes', category: 'breakfast', calories: 227, protein: 6, carbs: 28, fats: 10, fiber: 1 },

    // Lunch items
    { name: 'Grilled Chicken Breast', category: 'lunch', calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0 },
    { name: 'Brown Rice', category: 'lunch', calories: 112, protein: 2.6, carbs: 24, fats: 0.9, fiber: 1.8 },
    { name: 'Quinoa', category: 'lunch', calories: 120, protein: 4.4, carbs: 21, fats: 1.9, fiber: 2.8 },
    { name: 'Caesar Salad', category: 'lunch', calories: 184, protein: 7, carbs: 10, fats: 14, fiber: 2 },
    { name: 'Salmon Fillet', category: 'lunch', calories: 206, protein: 22, carbs: 0, fats: 13, fiber: 0 },
    { name: 'Pasta (Cooked)', category: 'lunch', calories: 131, protein: 5, carbs: 25, fats: 1.1, fiber: 1.8 },
    { name: 'Chicken Sandwich', category: 'lunch', calories: 260, protein: 18, carbs: 30, fats: 8, fiber: 2 },

    // Snacks
    { name: 'Apple', category: 'snacks', calories: 52, protein: 0.3, carbs: 14, fats: 0.2, fiber: 2.4 },
    { name: 'Almonds', category: 'snacks', calories: 579, protein: 21, carbs: 22, fats: 50, fiber: 12 },
    { name: 'Protein Bar', category: 'snacks', calories: 200, protein: 20, carbs: 22, fats: 6, fiber: 3 },
    { name: 'Hummus', category: 'snacks', calories: 166, protein: 8, carbs: 14, fats: 10, fiber: 6 },
    { name: 'Carrot Sticks', category: 'snacks', calories: 41, protein: 0.9, carbs: 10, fats: 0.2, fiber: 2.8 },
    { name: 'Mixed Nuts', category: 'snacks', calories: 607, protein: 20, carbs: 21, fats: 54, fiber: 7 },
    { name: 'Dark Chocolate', category: 'snacks', calories: 598, protein: 8, carbs: 46, fats: 43, fiber: 11 },

    // Dinner items
    { name: 'Grilled Steak', category: 'dinner', calories: 271, protein: 25, carbs: 0, fats: 19, fiber: 0 },
    { name: 'Baked Potato', category: 'dinner', calories: 93, protein: 2.5, carbs: 21, fats: 0.1, fiber: 2.2 },
    { name: 'Steamed Broccoli', category: 'dinner', calories: 34, protein: 2.8, carbs: 7, fats: 0.4, fiber: 2.6 },
    { name: 'Grilled Fish', category: 'dinner', calories: 136, protein: 29, carbs: 0, fats: 1.7, fiber: 0 },
    { name: 'Sweet Potato', category: 'dinner', calories: 86, protein: 1.6, carbs: 20, fats: 0.1, fiber: 3 },
    { name: 'Chicken Curry', category: 'dinner', calories: 180, protein: 15, carbs: 8, fats: 10, fiber: 2 },
    { name: 'Vegetable Stir Fry', category: 'dinner', calories: 120, protein: 4, carbs: 15, fats: 5, fiber: 4 },

    // Other common foods
    { name: 'White Rice', category: 'other', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4 },
    { name: 'Chicken Nuggets', category: 'other', calories: 296, protein: 15, carbs: 18, fats: 18, fiber: 1 },
    { name: 'Pizza Slice', category: 'other', calories: 285, protein: 12, carbs: 36, fats: 10, fiber: 2.5 },
    { name: 'Burger', category: 'other', calories: 354, protein: 20, carbs: 30, fats: 17, fiber: 2 },
    { name: 'French Fries', category: 'other', calories: 312, protein: 3.4, carbs: 41, fats: 15, fiber: 3.8 },
    { name: 'Ice Cream', category: 'other', calories: 207, protein: 3.5, carbs: 24, fats: 11, fiber: 0.7 },
    { name: 'Orange Juice', category: 'other', calories: 45, protein: 0.7, carbs: 10, fats: 0.2, fiber: 0.2 },
    { name: 'Milk (Whole)', category: 'other', calories: 61, protein: 3.2, carbs: 4.8, fats: 3.3, fiber: 0 },
    { name: 'Protein Shake', category: 'other', calories: 120, protein: 25, carbs: 3, fats: 1.5, fiber: 0 },
    { name: 'Peanut Butter', category: 'other', calories: 588, protein: 25, carbs: 20, fats: 50, fiber: 6 },
    { name: 'Bread (White)', category: 'other', calories: 265, protein: 9, carbs: 49, fats: 3.2, fiber: 2.7 },
    { name: 'Cheese', category: 'other', calories: 402, protein: 25, carbs: 1.3, fats: 33, fiber: 0 },
    { name: 'Tomato', category: 'other', calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2, fiber: 1.2 }
];

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing foods (only non-custom ones)
        await Food.deleteMany({ isCustom: false });
        console.log('🗑️  Cleared existing default foods');

        // Insert sample foods
        await Food.insertMany(sampleFoods);
        console.log('✅ Sample foods added to database');

        console.log(`📊 Total foods in database: ${sampleFoods.length}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
