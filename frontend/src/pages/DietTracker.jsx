import { useState, useEffect } from 'react';
import { dietService } from '../services';
import { Plus, Check, Camera, Search, Filter, Dumbbell, Clock, X, Edit2, Trash2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import Modal from '../components/ui/Modal';
import AddFoodModal from '../components/AddFoodModal';
import FoodPhotoUpload from '../components/FoodPhotoUpload';

export default function DietTracker() {
    const [entries, setEntries] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMealConfigModal, setShowMealConfigModal] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);
    
    // Gym-style meals structure (default: 4 meals, max: 6)
    const [meals, setMeals] = useState([
        { id: 'meal1', label: 'Meal 1', customName: 'Morning Fuel', timing: 'morning', icon: '☀️' },
        { id: 'meal2', label: 'Meal 2', customName: 'Pre-Workout', timing: 'pre-workout', icon: '💪' },
        { id: 'meal3', label: 'Meal 3', customName: 'Post-Workout', timing: 'post-workout', icon: '🏋️' },
        { id: 'meal4', label: 'Meal 4', customName: 'Evening Protein', timing: 'evening', icon: '🌙' }
    ]);

    useEffect(() => {
        loadEntries();
    }, [currentDate]);

    const loadEntries = async () => {
        try {
            const start = startOfMonth(currentDate);
            const end = endOfMonth(currentDate);
            const data = await dietService.getEntries({
                startDate: start.toISOString(),
                endDate: end.toISOString()
            });
            setEntries(data);
        } catch (error) {
            console.error('Error loading entries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEntry = (newEntry) => {
        setEntries([newEntry, ...entries]);
    };

    const toggleEntry = async (id) => {
        try {
            const updated = await dietService.toggleCompletion(id);
            setEntries(entries.map(e => e._id === id ? updated : e));
        } catch (error) {
            console.error('Error toggling entry:', error);
        }
    };

    const openAddModal = (mealId) => {
        setSelectedMeal(mealId);
        setShowAddModal(true);
    };

    // Add new meal (max 6 meals)
    const addNewMeal = () => {
        if (meals.length >= 6) {
            alert('Maximum 6 meals allowed');
            return;
        }
        const newMealNumber = meals.length + 1;
        const newMeal = {
            id: `meal${newMealNumber}`,
            label: `Meal ${newMealNumber}`,
            customName: `Meal ${newMealNumber}`,
            timing: 'anytime',
            icon: '🍽️'
        };
        setMeals([...meals, newMeal]);
    };

    // Remove meal
    const removeMeal = (mealId) => {
        if (meals.length <= 1) {
            alert('At least one meal is required');
            return;
        }
        setMeals(meals.filter(m => m.id !== mealId));
    };

    // Edit meal configuration
    const saveMealConfig = (mealId, config) => {
        setMeals(meals.map(m => m.id === mealId ? { ...m, ...config } : m));
        setShowMealConfigModal(false);
        setEditingMeal(null);
    };

    // Calculate macro summary for a meal on a specific day
    const getMealMacros = (mealId, day) => {
        const mealEntries = entries.filter(e =>
            e.category === mealId && isSameDay(new Date(e.date), day)
        );
        return mealEntries.reduce((acc, entry) => ({
            calories: acc.calories + (entry.calories || 0),
            protein: acc.protein + (entry.protein || 0),
            carbs: acc.carbs + (entry.carbs || 0),
            fats: acc.fats + (entry.fats || 0)
        }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
    };

    // Check if meal is high protein (>30g protein)
    const isHighProteinMeal = (macros) => macros.protein >= 30;

    const days = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
    });

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <Dumbbell className="w-8 h-8 text-primary-600" />
                        Gym Diet Tracker
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Track your meals with precision - gym style</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={addNewMeal}
                        disabled={meals.length >= 6}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Meal {meals.length < 6 && `(${6 - meals.length} left)`}
                    </button>
                    <button
                        onClick={() => setShowAIModal(true)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all text-sm"
                    >
                        <Camera className="w-4 h-4" />
                        AI Scan
                    </button>
                    <button
                        onClick={() => openAddModal(meals[0]?.id)}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Log Food
                    </button>
                </div>
            </div>

            {/* Meal Count & Info */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl border border-orange-200 dark:border-orange-800">
                <Dumbbell className="w-6 h-6 text-orange-600" />
                <div className="flex-1">
                    <p className="font-bold text-gray-800 dark:text-gray-200">Active Meals: {meals.length}/6</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Click on meal names to customize timing and labels</p>
                </div>
            </div>

            {/* Month Navigation */}
            <div className="glass rounded-2xl p-4 flex items-center justify-between border border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                    &larr; Prev
                </button>
                <div className="text-center">
                    <h2 className="text-xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
                    <p className="text-xs text-gray-500">Showing monthly view</p>
                </div>
                <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                    Next &rarr;
                </button>
            </div>

            {/* Grid View */}
            <div className="glass rounded-2xl p-4 md:p-6 overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                                <th className="sticky left-0 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800 p-3 md:p-4 text-left font-extrabold text-gray-700 dark:text-gray-200 uppercase text-xs tracking-wider z-20 border-r-2 border-gray-300 dark:border-gray-600 shadow-sm min-w-[140px] md:min-w-[180px]">
                                    <div className="flex items-center gap-2">
                                        <Dumbbell className="w-4 h-4 text-primary-600" />
                                        Gym Meals
                                    </div>
                                </th>
                                {days.slice(0, 31).map(day => (
                                    <th 
                                        key={day.toISOString()} 
                                        className={`p-3 md:p-4 text-center min-w-[70px] md:min-w-[80px] transition-colors ${
                                            isSameDay(day, new Date()) 
                                                ? 'bg-primary-100 dark:bg-primary-900/20 border-b-4 border-primary-500' 
                                                : 'bg-gray-50 dark:bg-gray-800/50'
                                        }`}
                                    >
                                        <div className="text-[10px] uppercase text-gray-500 dark:text-gray-400 font-bold mb-1">{format(day, 'EEE')}</div>
                                        <div className={`text-lg md:text-xl font-black ${
                                            isSameDay(day, new Date()) 
                                                ? 'text-primary-600 dark:text-primary-400' 
                                                : 'text-gray-700 dark:text-gray-300'
                                        }`}>
                                            {format(day, 'd')}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {meals.map((meal, idx) => (
                                <tr 
                                    key={meal.id} 
                                    className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors ${
                                        idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'
                                    }`}
                                >
                                    <td className="sticky left-0 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-800 p-2 md:p-3 z-10 border-r-2 border-gray-200 dark:border-gray-700 shadow-sm">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <span className="text-xl flex-shrink-0">{meal.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <button
                                                        onClick={() => {
                                                            setEditingMeal(meal);
                                                            setShowMealConfigModal(true);
                                                        }}
                                                        className="text-left w-full hover:text-primary-600 transition-colors group"
                                                    >
                                                        <div className="font-bold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{meal.label}</div>
                                                        <div className="font-bold text-sm md:text-base text-gray-800 dark:text-gray-100 truncate group-hover:text-primary-600">{meal.customName}</div>
                                                        <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                                                            <Clock className="w-3 h-3" />
                                                            <span className="capitalize">{meal.timing.replace('-', ' ')}</span>
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>
                                            {meals.length > 1 && (
                                                <button
                                                    onClick={() => removeMeal(meal.id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                                                    title="Remove meal"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    {days.slice(0, 31).map(day => {
                                        const dayEntries = entries.filter(e =>
                                            e.category === meal.id && isSameDay(new Date(e.date), day)
                                        );
                                        const isToday = isSameDay(day, new Date());
                                        const macros = getMealMacros(meal.id, day);
                                        const isHighProtein = isHighProteinMeal(macros);

                                        return (
                                            <td 
                                                key={day.toISOString()} 
                                                className={`p-2 md:p-3 text-center align-middle border-l border-gray-100 dark:border-gray-800 ${
                                                    isToday ? 'bg-primary-50/40 dark:bg-primary-900/10' : ''
                                                } ${isHighProtein ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                            >
                                                <div className="flex flex-col gap-2 items-center justify-center min-h-[60px]">
                                                    {dayEntries.length > 0 ? (
                                                        <div className="w-full space-y-1">
                                                            {dayEntries.map(entry => (
                                                                <button
                                                                    key={entry._id}
                                                                    onClick={() => toggleEntry(entry._id)}
                                                                    title={`${entry.foodName}: ${entry.calories} cal, ${entry.protein}g P`}
                                                                    className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-all transform hover:scale-110 shadow-md hover:shadow-lg mx-auto ${
                                                                        entry.completed
                                                                            ? isHighProtein
                                                                                ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-blue-500/30 hover:shadow-blue-500/50'
                                                                                : 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-green-500/30 hover:shadow-green-500/50'
                                                                            : 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-500 dark:text-gray-400'
                                                                    }`}
                                                                >
                                                                    {entry.completed ? <Check className="w-5 h-5 md:w-6 md:h-6" /> : <Plus className="w-4 h-4 md:w-5 md:h-5" />}
                                                                </button>
                                                            ))}
                                                            {macros.protein > 0 && (
                                                                <div className={`text-[9px] font-bold ${isHighProtein ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
                                                                    {Math.round(macros.protein)}g P
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        isToday && (
                                                            <button
                                                                onClick={() => openAddModal(meal.id)}
                                                                className="w-10 h-10 md:w-11 md:h-11 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:border-primary-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all transform hover:scale-105"
                                                            >
                                                                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Mobile-friendly scroll indicator */}
                <div className="mt-4 text-center md:hidden">
                    <p className="text-xs text-gray-500 dark:text-gray-400">← Swipe to see more days →</p>
                </div>
            </div>

            {/* Today's Summary Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Dumbbell className="w-5 h-5 text-primary-500" />
                        Today's Meal Log
                    </h2>
                    <div className="space-y-4">
                        {meals.map(meal => {
                            const mealEntries = entries.filter(e => e.category === meal.id && isSameDay(new Date(e.date), new Date()));
                            const macros = getMealMacros(meal.id, new Date());
                            const isHighProtein = isHighProteinMeal(macros);
                            
                            return (
                                <div key={meal.id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold uppercase text-gray-400 tracking-wider ml-2 flex items-center gap-2">
                                            <span>{meal.icon}</span>
                                            <span>{meal.customName}</span>
                                            {isHighProtein && (
                                                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                                    High Protein
                                                </span>
                                            )}
                                        </h3>
                                        {macros.calories > 0 && (
                                            <div className="text-xs font-bold text-gray-500 flex gap-3">
                                                <span>{Math.round(macros.calories)} cal</span>
                                                <span className="text-blue-600">{Math.round(macros.protein)}g P</span>
                                                <span className="text-green-600">{Math.round(macros.carbs)}g C</span>
                                                <span className="text-orange-600">{Math.round(macros.fats)}g F</span>
                                            </div>
                                        )}
                                    </div>
                                    {mealEntries.length > 0 ? (
                                        mealEntries.map(entry => (
                                            <div key={entry._id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 group hover:border-primary-300 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-xl ${entry.completed ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                                                        {entry.aiDetected ? <Camera className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold">{entry.foodName}</h4>
                                                        <p className="text-xs text-gray-500">
                                                            {entry.quantity}g • {entry.calories} kcal • {entry.protein}g P • {entry.carbs}g C • {entry.fats}g F
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => toggleEntry(entry._id)}
                                                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${entry.completed
                                                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                        }`}
                                                >
                                                    {entry.completed ? 'Logged' : 'Log'}
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <button
                                            onClick={() => openAddModal(meal.id)}
                                            className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 hover:text-primary-500 hover:border-primary-500 text-sm font-medium transition-all"
                                        >
                                            + Add {meal.customName}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="glass rounded-2xl p-6 border border-gray-200 dark:border-gray-700 h-fit space-y-6">
                    <div className="p-4 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl text-white">
                        <p className="text-xs font-bold uppercase opacity-80 mb-1">Gym Tip</p>
                        <p className="text-sm font-medium">Aim for 30g+ protein per meal to maximize muscle protein synthesis!</p>
                    </div>

                    <div>
                        <h3 className="font-bold mb-4">Legend</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center text-white">
                                    <Check className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium">Meal Logged</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                                    <Check className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium">High Protein (30g+)</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                                    <Plus className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium">Entry Pending</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                        <h4 className="font-bold text-sm mb-2">Meal Timing Tips</h4>
                        <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                            <li>• Pre-Workout: 1-2 hours before</li>
                            <li>• Post-Workout: Within 30-60 min</li>
                            <li>• Protein: Spread across meals</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title={`Add Food to ${meals.find(m => m.id === selectedMeal)?.customName || 'Meal'}`}
            >
                <AddFoodModal
                    onAdd={handleAddEntry}
                    onClose={() => setShowAddModal(false)}
                    category={selectedMeal}
                    date={new Date()}
                />
            </Modal>

            <Modal
                isOpen={showAIModal}
                onClose={() => setShowAIModal(false)}
                title="AI Food Scan"
            >
                <FoodPhotoUpload
                    onAdd={handleAddEntry}
                    onClose={() => setShowAIModal(false)}
                    category={meals[0]?.id || 'meal1'}
                />
            </Modal>

            {/* Meal Configuration Modal */}
            <Modal
                isOpen={showMealConfigModal}
                onClose={() => {
                    setShowMealConfigModal(false);
                    setEditingMeal(null);
                }}
                title={`Configure ${editingMeal?.label}`}
            >
                {editingMeal && (
                    <MealConfigForm
                        meal={editingMeal}
                        onSave={(config) => saveMealConfig(editingMeal.id, config)}
                        onCancel={() => {
                            setShowMealConfigModal(false);
                            setEditingMeal(null);
                        }}
                    />
                )}
            </Modal>
        </div>
    );
}

// Meal Configuration Form Component
function MealConfigForm({ meal, onSave, onCancel }) {
    const [config, setConfig] = useState({
        customName: meal.customName,
        timing: meal.timing,
        icon: meal.icon
    });

    const timingOptions = [
        { value: 'pre-workout', label: 'Pre-Workout', icon: '💪' },
        { value: 'post-workout', label: 'Post-Workout', icon: '🏋️' },
        { value: 'morning', label: 'Morning', icon: '☀️' },
        { value: 'afternoon', label: 'Afternoon', icon: '🌤️' },
        { value: 'evening', label: 'Evening', icon: '🌙' },
        { value: 'night', label: 'Night', icon: '🌃' },
        { value: 'anytime', label: 'Anytime', icon: '🍽️' }
    ];

    const iconOptions = ['💪', '🏋️', '🥗', '🍗', '🥤', '🍳', '🥙', '🍽️', '⚡', '🔥'];

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium mb-2">Custom Meal Name</label>
                <input
                    type="text"
                    value={config.customName}
                    onChange={(e) => setConfig({ ...config, customName: e.target.value })}
                    placeholder="e.g., Post-Workout Shake"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none transition"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Meal Timing</label>
                <div className="grid grid-cols-2 gap-2">
                    {timingOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => setConfig({ ...config, timing: option.value })}
                            className={`p-3 rounded-xl border-2 transition-all text-left ${
                                config.timing === option.value
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-xl">{option.icon}</span>
                                <span className="text-sm font-medium">{option.label}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Meal Icon</label>
                <div className="flex flex-wrap gap-2">
                    {iconOptions.map(icon => (
                        <button
                            key={icon}
                            onClick={() => setConfig({ ...config, icon })}
                            className={`w-12 h-12 text-2xl rounded-xl border-2 transition-all ${
                                config.icon === icon
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-110'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {icon}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    onClick={onCancel}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium"
                >
                    Cancel
                </button>
                <button
                    onClick={() => onSave(config)}
                    className="flex-1 px-4 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition font-bold"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
}
