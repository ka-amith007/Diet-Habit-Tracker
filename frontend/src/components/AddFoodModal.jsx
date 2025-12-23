import { useState, useEffect } from 'react';
import { foodService, dietService } from '../services';
import { Search, Plus, Calculator, Camera } from 'lucide-react';

export default function AddFoodModal({ isOpen, onClose, onAdd, date, category }) {
    const [search, setSearch] = useState('');
    const [foods, setFoods] = useState([]);
    const [selectedFood, setSelectedFood] = useState(null);
    const [quantity, setQuantity] = useState(100);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);

    useEffect(() => {
        if (search.length > 2) {
            const delayDebounceFn = setTimeout(() => {
                handleSearch();
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        } else if (search.length === 0) {
            setFoods([]);
        }
    }, [search]);

    const handleSearch = async () => {
        setSearchLoading(true);
        try {
            const results = await foodService.searchFoods(search);
            setFoods(results);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFood) return;

        setLoading(true);
        try {
            const entryData = {
                foodId: selectedFood._id,
                foodName: selectedFood.name,
                date: date || new Date(),
                category: category || 'breakfast',
                quantity: Number(quantity),
                unit: 'grams'
            };
            const newEntry = await dietService.addEntry(entryData);
            onAdd(newEntry);
            onClose();
        } catch (error) {
            console.error('Failed to add food:', error);
            alert('Failed to add food entry');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {!selectedFood ? (
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for a food..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none transition"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {searchLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="spinner border-primary-500"></div>
                            </div>
                        ) : foods.length > 0 ? (
                            foods.map(food => (
                                <button
                                    key={food._id}
                                    onClick={() => setSelectedFood(food)}
                                    className="w-full p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition group"
                                >
                                    <div className="text-left">
                                        <p className="font-semibold group-hover:text-primary-600 dark:group-hover:text-primary-400">
                                            {food.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {food.calories} cal per 100g
                                        </p>
                                    </div>
                                    <Plus className="w-5 h-5 text-gray-400 group-hover:text-primary-500" />
                                </button>
                            ))
                        ) : search.length > 2 ? (
                            <p className="text-center text-gray-500 py-8">No results found</p>
                        ) : (
                            <p className="text-center text-gray-500 py-8">Start typing to search foods</p>
                        )}
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                        <h3 className="font-bold text-primary-700 dark:text-primary-400 text-lg">
                            {selectedFood.name}
                        </h3>
                        <p className="text-sm text-primary-600 dark:text-primary-500">
                            {selectedFood.calories} calories / 100g
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Quantity (grams)</label>
                            <div className="relative">
                                <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="number"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none transition"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-xs text-gray-500">Total Calories</p>
                                <p className="font-bold">{Math.round((selectedFood.calories * quantity) / 100)} kcal</p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-xs text-gray-500">Total Protein</p>
                                <p className="font-bold">{((selectedFood.protein * quantity) / 100).toFixed(1)} g</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setSelectedFood(null)}
                            className="flex-1 px-4 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-2 btn-primary px-8 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="spinner border-white" />
                            ) : (
                                'Add to Log'
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
