import { useState, useEffect } from 'react';
import { userService } from '../services';
import { User, Save } from 'lucide-react';

export default function Profile() {
    const [profile, setProfile] = useState({
        name: '',
        age: '',
        height: '',
        weight: '',
        gender: 'male',
        goal: 'maintenance',
        dietPreference: 'non_vegetarian',
        activityLevel: 'moderate'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [calculatedTargets, setCalculatedTargets] = useState({
        calories: 2000,
        protein: 150,
        carbs: 200,
        fats: 65
    });

    useEffect(() => {
        loadProfile();
    }, []);

    // Calculate targets whenever profile data changes
    useEffect(() => {
        const calculateNutritionTargets = () => {
            const age = parseFloat(profile.age);
            const height = parseFloat(profile.height);
            const weight = parseFloat(profile.weight);

            if (!age || !height || !weight) {
                return { calories: 2000, protein: 150, carbs: 200, fats: 65 };
            }

            // Step 1: Calculate BMR using Mifflin-St Jeor Equation
            let bmr;
            if (profile.gender === 'male') {
                bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
            } else {
                bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
            }

            // Step 2: Calculate TDEE using Activity Multiplier
            const activityMultipliers = {
                'sedentary': 1.2,
                'light': 1.375,
                'moderate': 1.55,
                'active': 1.725,
                'very_active': 1.9
            };
            const tdee = bmr * (activityMultipliers[profile.activityLevel] || 1.55);

            // Step 3: Adjust Calories Based on Goal
            let targetCalories;
            if (profile.goal === 'weight_loss') {
                targetCalories = tdee - 500;
            } else if (profile.goal === 'muscle_gain') {
                targetCalories = tdee + 300;
            } else {
                targetCalories = tdee;
            }

            // Step 4: Calculate Macros
            // Protein: 2.0g per kg body weight (average of 1.8-2.2)
            const protein = Math.round(weight * 2.0);

            // Fats: 27.5% of total calories (average of 25-30%)
            const fatsCalories = targetCalories * 0.275;
            const fats = Math.round(fatsCalories / 9); // 9 calories per gram of fat

            // Carbs: Remaining calories
            const proteinCalories = protein * 4; // 4 calories per gram of protein
            const remainingCalories = targetCalories - proteinCalories - fatsCalories;
            const carbs = Math.round(remainingCalories / 4); // 4 calories per gram of carbs

            return {
                calories: Math.round(targetCalories),
                protein: protein,
                carbs: carbs,
                fats: fats
            };
        };

        if (profile.age && profile.height && profile.weight) {
            const targets = calculateNutritionTargets();
            setCalculatedTargets(targets);
        }
    }, [profile.age, profile.height, profile.weight, profile.gender, profile.activityLevel, profile.goal]);

    const loadProfile = async () => {
        try {
            const data = await userService.getProfile();
            setProfile(data);
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await userService.updateProfile(profile);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold mb-2">Profile</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your personal information</p>
            </div>

            <div className="glass rounded-xl p-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{profile.name}</h2>
                        <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={profile.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Age</label>
                            <input
                                type="number"
                                name="age"
                                value={profile.age}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Height (cm)</label>
                            <input
                                type="number"
                                name="height"
                                value={profile.height}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                            <input
                                type="number"
                                name="weight"
                                value={profile.weight}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Gender</label>
                            <select
                                name="gender"
                                value={profile.gender}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none transition"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Goal</label>
                            <select
                                name="goal"
                                value={profile.goal}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none transition"
                            >
                                <option value="weight_loss">Weight Loss</option>
                                <option value="muscle_gain">Muscle Gain</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Diet Preference</label>
                            <select
                                name="dietPreference"
                                value={profile.dietPreference}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none transition"
                            >
                                <option value="vegetarian">Vegetarian</option>
                                <option value="non_vegetarian">Non-Vegetarian</option>
                                <option value="vegan">Vegan</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Activity Level</label>
                            <select
                                name="activityLevel"
                                value={profile.activityLevel}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none transition"
                            >
                                <option value="sedentary">Sedentary</option>
                                <option value="light">Light</option>
                                <option value="moderate">Moderate</option>
                                <option value="active">Active</option>
                                <option value="very_active">Very Active</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <div className="spinner border-white"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>Save Profile</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <h3 className="font-bold text-lg">Calculated Targets</h3>
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-semibold ml-auto">Live</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">Based on Mifflin-St Jeor equation and your activity level</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Daily Calories</p>
                            <p className="text-2xl font-black text-primary-600 dark:text-primary-400">{calculatedTargets.calories}</p>
                            <p className="text-xs text-gray-500 mt-1">kcal/day</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Protein</p>
                            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{calculatedTargets.protein}g</p>
                            <p className="text-xs text-gray-500 mt-1">~{profile.weight ? (calculatedTargets.protein / parseFloat(profile.weight)).toFixed(1) : '2.0'}g/kg</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Carbs</p>
                            <p className="text-2xl font-black text-green-600 dark:text-green-400">{calculatedTargets.carbs}g</p>
                            <p className="text-xs text-gray-500 mt-1">{Math.round((calculatedTargets.carbs * 4 / calculatedTargets.calories) * 100)}% cals</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Fats</p>
                            <p className="text-2xl font-black text-orange-600 dark:text-orange-400">{calculatedTargets.fats}g</p>
                            <p className="text-xs text-gray-500 mt-1">{Math.round((calculatedTargets.fats * 9 / calculatedTargets.calories) * 100)}% cals</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
