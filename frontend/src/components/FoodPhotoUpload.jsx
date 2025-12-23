import { useState, useRef } from 'react';
import { foodService, dietService } from '../services';
import { Camera, Upload, Check, X, AlertCircle } from 'lucide-react';

export default function FoodPhotoUpload({ onAdd, date, category }) {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
            setResult(null);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!image) return;

        setLoading(true);
        setError('');
        try {
            const response = await foodService.analyzeImage(image);
            setResult(response.detected);
        } catch (err) {
            console.error('Analysis failed:', err);
            setError('AI Food recognition failed. Please try again or add manually.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!result) return;

        setLoading(true);
        try {
            // First, find or create the food in the database to get an ID
            // For simplicity in this mock, we'll assume the backend handles it or we use a generic ID
            // In a real app, analyzeImage would return a food database match or create a custom one

            // Since analyzeImage is mock, let's just use the result to add an entry
            // For the mock, we need a foodId. Let's search for the food by name first
            const foods = await foodService.searchFoods(result.name);
            let foodId;

            if (foods.length > 0) {
                foodId = foods[0]._id;
            } else {
                // Create custom food if not found
                const newFood = await foodService.addFood({
                    name: result.name,
                    category: category || 'lunch',
                    calories: result.calories,
                    protein: result.protein,
                    carbs: result.carbs,
                    fats: result.fats
                });
                foodId = newFood._id;
            }

            const newEntry = await dietService.addEntry({
                foodId,
                foodName: result.name,
                date: date || new Date(),
                category: category || 'lunch',
                quantity: result.quantity,
                unit: 'grams',
                aiDetected: true,
                confidence: result.confidence
            });

            onAdd(newEntry);
            reset();
        } catch (err) {
            console.error('Confirmation failed:', err);
            setError('Failed to log the detected food.');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setImage(null);
        setPreview(null);
        setResult(null);
        setError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="glass rounded-2xl p-6 border-2 border-dashed border-primary-200 dark:border-primary-900/30">
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">AI Food Recognition</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upload a photo of your meal and let AI calculate the calories!</p>
            </div>

            {!preview ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center py-12 cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/10 transition rounded-xl"
                >
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
                        <Camera className="w-8 h-8 text-primary-600" />
                    </div>
                    <p className="font-semibold text-primary-700 dark:text-primary-400">Click to capture or upload</p>
                    <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG (Max 10MB)</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="relative rounded-xl overflow-hidden aspect-video bg-black">
                        <img src={preview} alt="Food preview" className="w-full h-full object-contain" />
                        <button
                            onClick={reset}
                            className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {!result ? (
                        <button
                            onClick={handleUpload}
                            disabled={loading}
                            className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="spinner border-white" />
                                    <span>Analyzing Image...</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    <span>Analyze Meal</span>
                                </>
                            )}
                        </button>
                    ) : (
                        <div className="space-y-6 animate-slide-up">
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-green-700 dark:text-green-400 px-2 py-1 bg-green-100 dark:bg-green-800/50 rounded">
                                        {result.confidence}% Match
                                    </span>
                                    <span className="text-sm text-gray-500">Detected Item</span>
                                </div>
                                <h4 className="text-2xl font-bold dark:text-white capitalize">{result.name}</h4>

                                <div className="grid grid-cols-3 gap-4 mt-6">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">Calories</p>
                                        <p className="text-lg font-bold">{result.calories}</p>
                                    </div>
                                    <div className="text-center border-x border-green-200 dark:border-green-800">
                                        <p className="text-xs text-gray-500">Protein</p>
                                        <p className="text-lg font-bold">{result.protein}g</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">Carbs</p>
                                        <p className="text-lg font-bold">{result.carbs}g</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={reset}
                                    className="flex-1 px-4 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                                >
                                    Retry
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={loading}
                                    className="flex-2 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-500/30 transition-all transform hover:-translate-y-1"
                                >
                                    {loading ? (
                                        <div className="spinner border-white" />
                                    ) : (
                                        <>
                                            <Check className="w-6 h-6" />
                                            <span>Confirm & Log</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
