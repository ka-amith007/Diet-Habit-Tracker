import { useState, useEffect } from 'react';
import { analyticsService } from '../services';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';

export default function Analytics() {
    const [macros, setMacros] = useState(null);
    const [weekly, setWeekly] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const [macroData, weeklyData] = await Promise.all([
                analyticsService.getMacroBreakdown(),
                analyticsService.getWeeklySummary()
            ]);
            setMacros(macroData);
            setWeekly(weeklyData);
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = async () => {
        try {
            const blob = await analyticsService.exportPDF();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'diet-report.pdf';
            a.click();
        } catch (error) {
            console.error('Error downloading PDF:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner border-primary-500"></div>
            </div>
        );
    }

    const pieData = macros ? [
        { name: 'Protein', value: macros.percentages.protein, color: '#3b82f6' },
        { name: 'Carbs', value: macros.percentages.carbs, color: '#22c55e' },
        { name: 'Fats', value: macros.percentages.fats, color: '#f59e0b' }
    ] : [];

    const barData = weekly ? Object.entries(weekly).map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fats: data.fats
    })) : [];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Analytics</h1>
                    <p className="text-gray-600 dark:text-gray-400">Track your progress over time</p>
                </div>
                <button
                    onClick={downloadPDF}
                    className="btn-primary flex items-center gap-2"
                >
                    <Download className="w-5 h-5" />
                    Export PDF
                </button>
            </div>

            {/* Macro Breakdown */}
            <div className="glass rounded-xl p-6">
                <h2 className="text-xl font-bold mb-6">Today's Macro Breakdown</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Protein</p>
                            <p className="text-2xl font-bold text-blue-600">{macros?.grams.protein.toFixed(1)}g</p>
                            <p className="text-sm text-gray-500">{macros?.percentages.protein}% of total</p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Carbs</p>
                            <p className="text-2xl font-bold text-green-600">{macros?.grams.carbs.toFixed(1)}g</p>
                            <p className="text-sm text-gray-500">{macros?.percentages.carbs}% of total</p>
                        </div>
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Fats</p>
                            <p className="text-2xl font-bold text-orange-600">{macros?.grams.fats.toFixed(1)}g</p>
                            <p className="text-sm text-gray-500">{macros?.percentages.fats}% of total</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly Progress */}
            <div className="glass rounded-xl p-6">
                <h2 className="text-xl font-bold mb-6">Weekly Calorie Intake</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="calories" fill="#8b5cf6" name="Calories" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
