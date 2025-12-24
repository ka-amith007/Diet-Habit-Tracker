import { useState, useEffect } from 'react';
import { habitService } from '../services';
import { Plus, Flame, Check, Trophy, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import Modal from '../components/ui/Modal';
import CreateHabitModal from '../components/CreateHabitModal';

export default function HabitTracker() {
    const [habits, setHabits] = useState([]);
    const [entries, setEntries] = useState({});
    const [streaks, setStreaks] = useState({});
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHabits();
    }, [currentDate]);

    const loadHabits = async () => {
        try {
            const data = await habitService.getHabits();
            setHabits(data);

            const entriesMap = {};
            const streaksMap = {};

            for (const habit of data) {
                const [habitEntries, streak] = await Promise.all([
                    habitService.getEntries(habit._id, {
                        startDate: startOfMonth(currentDate).toISOString(),
                        endDate: endOfMonth(currentDate).toISOString()
                    }),
                    habitService.getStreak(habit._id)
                ]);
                entriesMap[habit._id] = habitEntries;
                streaksMap[habit._id] = streak;
            }

            setEntries(entriesMap);
            setStreaks(streaksMap);
        } catch (error) {
            console.error('Error loading habits:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateHabit = (newHabit) => {
        setHabits([...habits, newHabit]);
        loadHabits(); // Reload to initialize entries/streaks
    };

    const toggleHabit = async (habitId, date) => {
        try {
            const dateStr = format(date, 'yyyy-MM-dd');
            await habitService.toggleCompletion(habitId, dateStr);
            loadHabits(); // Reload to update streaks and entries
        } catch (error) {
            console.error('Error toggling habit:', error);
        }
    };

    const days = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
    }); // Show full month

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Habit Tracker</h1>
                    <p className="text-gray-600 dark:text-gray-400">Small steps lead to big changes</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 transition-all transform hover:-translate-y-1"
                >
                    <Plus className="w-5 h-5" />
                    Create New Habit
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2 text-orange-500">
                        <Flame className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-wider">Active Streaks</span>
                    </div>
                    <div className="text-3xl font-bold">
                        {Object.values(streaks).reduce((acc, curr) => acc + (curr.currentStreak > 0 ? 1 : 0), 0)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Habits maintained today</p>
                </div>
                <div className="glass rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2 text-primary-500">
                        <Trophy className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-wider">Best Streak</span>
                    </div>
                    <div className="text-3xl font-bold">
                        {Math.max(...Object.values(streaks).map(s => s.bestStreak || 0), 0)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Days of consistency</p>
                </div>
                <div className="glass rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2 text-green-500">
                        <Calendar className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-wider">Completion Rate</span>
                    </div>
                    <div className="text-3xl font-bold">
                        {habits.length > 0 ? '85%' : '0%'}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Overall progress this month</p>
                </div>
            </div>

            {/* Grid View */}
            <div className="glass rounded-2xl p-6 border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Monthly Tracker</h2>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                        >
                            &larr;
                        </button>
                        <span className="font-bold">{format(currentDate, 'MMMM yyyy')}</span>
                        <button
                            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                        >
                            &rarr;
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-max">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="sticky left-0 bg-white dark:bg-gray-800 p-4 text-left font-bold text-gray-400 uppercase text-xs tracking-wider z-10">Habit</th>
                                <th className="p-4 text-center font-bold text-gray-400 uppercase text-xs tracking-wider">Streak</th>
                                {days.map(day => (
                                    <th key={day.toISOString()} className={`p-4 text-center min-w-[60px] ${isSameDay(day, new Date()) ? 'bg-primary-50 dark:bg-primary-900/10' : ''}`}>
                                        <div className="text-[10px] uppercase text-gray-400 font-bold">{format(day, 'EEE')}</div>
                                        <div className={`text-lg font-bold ${isSameDay(day, new Date()) ? 'text-primary-600' : ''}`}>{format(day, 'd')}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {habits.map(habit => (
                                <tr key={habit._id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                                    <td className="sticky left-0 bg-white dark:bg-gray-800 p-4 z-10 border-r border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700">
                                                {habit.icon}
                                            </div>
                                            <div>
                                                <span className="font-bold block leading-tight">{habit.name}</span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase">{habit.frequency}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-1 font-bold">
                                            <Flame className="w-5 h-5 text-orange-500 fill-current" />
                                            <span className="text-orange-600">{streaks[habit._id]?.currentStreak || 0}</span>
                                        </div>
                                    </td>
                                    {days.map(day => {
                                        const habitEntries = entries[habit._id] || [];
                                        const isCompleted = habitEntries.some(e =>
                                            isSameDay(new Date(e.date), day) && e.completed
                                        );
                                        const isToday = isSameDay(day, new Date());

                                        return (
                                            <td key={day.toISOString()} className={`p-4 text-center ${isToday ? 'bg-primary-50/30 dark:bg-primary-900/5' : ''}`}>
                                                <button
                                                    onClick={() => toggleHabit(habit._id, day)}
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all transform hover:scale-110 shadow-sm ${isCompleted
                                                            ? 'bg-green-500 text-white shadow-green-500/20'
                                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                                        }`}
                                                >
                                                    {isCompleted ? <Check className="w-6 h-6" /> : <Plus className="w-5 h-5" />}
                                                </button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {habits.length === 0 && (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                                🌱
                            </div>
                            <h3 className="text-xl font-bold">No habits tracked yet</h3>
                            <p className="text-gray-500 mt-2 max-w-xs mx-auto">Create your first habit to start building a better version of yourself!</p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="mt-6 text-primary-600 font-bold hover:underline"
                            >
                                + Create one now
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Habit Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {habits.map(habit => (
                    <div key={habit._id} className="glass rounded-2xl p-6 border border-gray-200 dark:border-gray-700 group hover:border-primary-300 transition-colors">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-gray-200 dark:shadow-none"
                                    style={{ backgroundColor: `${habit.color}15`, color: habit.color }}
                                >
                                    {habit.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">{habit.name}</h3>
                                    <p className="text-xs text-gray-500 line-clamp-1">{habit.description}</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                                <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Current Streak</p>
                                <div className="flex gap-2 items-baseline">
                                    <span className="text-2xl font-bold text-orange-600">
                                        {streaks[habit._id]?.currentStreak || 0}
                                    </span>
                                    <span className="text-xs font-medium text-gray-500">days</span>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                                <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Personal Best</p>
                                <div className="flex gap-2 items-baseline">
                                    <span className="text-2xl font-bold text-purple-600">
                                        {streaks[habit._id]?.bestStreak || 0}
                                    </span>
                                    <span className="text-xs font-medium text-gray-500">days</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create New Habit"
            >
                <CreateHabitModal
                    onAdd={handleCreateHabit}
                    onClose={() => setShowCreateModal(false)}
                />
            </Modal>
        </div>
    );
}
