import { useState, useEffect } from 'react';
import { waterService } from '../services';
import { Droplet, Plus, Minus, Info } from 'lucide-react';

export default function WaterTracker({ onUpdate }) {
    const [water, setWater] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWater();
    }, []);

    const loadWater = async () => {
        try {
            const data = await waterService.getTodayWater();
            setWater(data);
        } catch (error) {
            console.error('Error loading water:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (change) => {
        if (loading || !water) return;

        const newCount = water.glasses + change;
        if (newCount < 0) return;

        try {
            const updated = await waterService.logWater({ glasses: change });
            setWater(updated);
            if (onUpdate) onUpdate(updated);
        } catch (error) {
            console.error('Error updating water:', error);
        }
    };

    if (loading) return <div className="h-48 flex items-center justify-center spinner border-blue-500" />;

    const percentage = (water.glasses / water.target) * 100;

    return (
        <div className="glass rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                        <Droplet className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Water Intake</h3>
                        <p className="text-sm text-gray-500">Stay hydrated throughout the day</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold text-blue-600">{water.glasses}</span>
                    <span className="text-gray-400 font-medium"> / {water.target} glasses</span>
                </div>
            </div>

            <div className="relative h-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-8 overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>

            <div className="flex items-center justify-between gap-4">
                <button
                    onClick={() => handleUpdate(-1)}
                    className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all flex items-center justify-center"
                >
                    <Minus className="w-6 h-6" />
                </button>
                <button
                    onClick={() => handleUpdate(1)}
                    className="flex-2 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/30 font-bold transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                    <Plus className="w-6 h-6" />
                    Add Glass
                </button>
            </div>

            <div className="mt-6 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-700 dark:text-blue-400">
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-medium">
                    Typical target for {water.gender === 'female' ? 'women' : 'men'} is {water.target} glasses. One glass is approx 250ml.
                </p>
            </div>
        </div>
    );
}
