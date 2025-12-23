import { useState, useEffect } from 'react';
import { analyticsService } from '../services';
import { Flame, Target, TrendingUp, Zap, Calendar, Heart, Award } from 'lucide-react';
import WaterTracker from '../components/WaterTracker';

export default function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const summaryData = await analyticsService.getDailySummary();
            setSummary(summaryData);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="spinner border-primary-500"></div>
            </div>
        );
    }

    const caloriePercent = summary ? (summary.consumed.calories / summary.targets.calories) * 100 : 0;
    const proteinPercent = summary ? (summary.consumed.protein / summary.targets.protein) * 100 : 0;
    const carbsPercent = summary ? (summary.consumed.carbs / summary.targets.carbs) * 100 : 0;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold mb-2 tracking-tight">Daily Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Your progress for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <Zap className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="font-bold">Active Streak: 5 Days</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Stats Column */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Calorie Progress Card */}
                    <div className="glass rounded-3xl p-8 relative overflow-hidden border border-gray-200 dark:border-gray-700 group transition-all hover:shadow-2xl hover:shadow-primary-500/10">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Flame className="w-32 h-32 text-orange-500" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-orange-500 mb-6">
                                <Flame className="w-6 h-6 fill-current" />
                                <span className="font-extrabold uppercase tracking-widest text-sm">Energy Intake</span>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
                                <div>
                                    <p className="text-5xl font-black">{summary?.consumed.calories || 0}</p>
                                    <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mt-1">Calories Consumed</p>
                                </div>
                                <div className="h-10 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-400">{summary?.remaining.calories || 0}</p>
                                    <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mt-1">Remaining Goal</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm font-bold">
                                    <span>Progress</span>
                                    <span>{Math.round(caloriePercent)}%</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-4 p-1 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-orange-400 via-red-500 to-primary-600 h-2 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${Math.min(caloriePercent, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Macro Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Protein */}
                        <div className="glass rounded-3xl p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                                    <Target className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Protein</span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black">{summary?.consumed.protein.toFixed(0) || 0}</span>
                                    <span className="text-xs font-bold text-gray-400">/ {summary?.targets.protein}g</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-blue-500 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(proteinPercent, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Carbs */}
                        <div className="glass rounded-3xl p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Carbs</span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black">{summary?.consumed.carbs.toFixed(0) || 0}</span>
                                    <span className="text-xs font-bold text-gray-400">/ {summary?.targets.carbs}g</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-green-500 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(carbsPercent, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Total Meals */}
                        <div className="glass rounded-3xl p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl">
                                    <Heart className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Efficiency</span>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-2xl font-black">Good</span>
                                    <span className="block text-xs font-bold text-gray-500">Stability Index</span>
                                </div>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i <= 4 ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'}`} />)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Insights Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl text-white shadow-xl shadow-blue-500/20">
                            <Award className="w-8 h-8 mb-4 opacity-50" />
                            <h3 className="text-xl font-bold mb-2">Weekly Goal Check</h3>
                            <p className="text-indigo-100 text-sm mb-4">You've hit your protein target 4 days in a row! You're 3 days away from a 'Dedicated' badge.</p>
                            <button className="text-sm font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition">View Achievements</button>
                        </div>

                        <div className="p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold flex items-center gap-2 mb-2">
                                    <Calendar className="w-5 h-5 text-primary-500" />
                                    Recommended for Dinner
                                </h3>
                                <p className="text-sm text-gray-500">Based on your remaining macros, a Grilled Chicken Salad (350 cal) would be perfect.</p>
                            </div>
                            <a href="/diet" className="text-primary-600 text-sm font-bold mt-4 hover:underline">Log your next meal &rarr;</a>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar Column */}
                <div className="space-y-8">
                    <WaterTracker />

                    <div className="glass rounded-3xl p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500 fill-current" />
                            Quick Actions
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <a href="/diet" className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl text-center hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                <div className="text-2xl mb-1">🍎</div>
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Log Food</span>
                            </a>
                            <a href="/habits" className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl text-center hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                <div className="text-2xl mb-1">✅</div>
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Habits</span>
                            </a>
                            <a href="/analytics" className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl text-center hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                <div className="text-2xl mb-1">📊</div>
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Stats</span>
                            </a>
                            <a href="/profile" className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl text-center hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                <div className="text-2xl mb-1">👤</div>
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Goal</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
