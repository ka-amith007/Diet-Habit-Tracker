import { useState } from 'react';
import { habitService } from '../services';
import { Plus, Tag, MessageSquare, Palette } from 'lucide-react';

const icons = ['💧', '🏃', '🥗', '📚', '🧘', '🚭', '🍎', '💪', '🚿', '🛌'];
const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

export default function CreateHabitModal({ onAdd, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: icons[0],
        color: colors[0],
        frequency: 'daily'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const newHabit = await habitService.createHabit(formData);
            onAdd(newHabit);
            onClose();
        } catch (error) {
            console.error('Failed to create habit:', error);
            alert('Failed to create habit');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-gray-400">Habit Name</label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none transition"
                            placeholder="e.g. Morning Run, Drink Water"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-gray-400">Description (Optional)</label>
                    <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <textarea
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none transition min-h-[100px]"
                            placeholder="Why this habit is important..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold mb-3 uppercase tracking-wider text-gray-400">Choose Icon</label>
                    <div className="flex flex-wrap gap-2">
                        {icons.map(icon => (
                            <button
                                key={icon}
                                type="button"
                                onClick={() => setFormData({ ...formData, icon })}
                                className={`w-12 h-12 flex items-center justify-center text-2xl rounded-xl transition ${formData.icon === icon
                                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                                        : 'bg-gray-100 dark:bg-gray-800 border border-transparent hover:border-gray-300'
                                    }`}
                            >
                                {icon}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold mb-3 uppercase tracking-wider text-gray-400">Theme Color</label>
                    <div className="flex flex-wrap gap-3">
                        {colors.map(color => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setFormData({ ...formData, color })}
                                className="group relative w-10 h-10 rounded-full transition-transform active:scale-90"
                                style={{ backgroundColor: color }}
                            >
                                {formData.color === color && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 flex items-center justify-center gap-2 font-bold text-lg disabled:opacity-50"
            >
                {loading ? (
                    <div className="spinner border-white" />
                ) : (
                    <>
                        <Plus className="w-6 h-6" />
                        Create Habit
                    </>
                )}
            </button>
        </form>
    );
}
