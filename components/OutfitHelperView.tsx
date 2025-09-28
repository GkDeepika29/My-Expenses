import React, { useState, useCallback } from 'react';
import type { ClothingItem } from '../types';
import { getOutfitSuggestion } from '../services/geminiService';
import type { OutfitSuggestion } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { IroningStatus } from '../types';

interface OutfitHelperViewProps {
    wardrobe: ClothingItem[];
    aiFeaturesEnabled: boolean;
}

const SuggestionCard: React.FC<{ item: ClothingItem }> = ({ item }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:border dark:border-gray-700 overflow-hidden text-center">
        <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover" />
        <div className="p-3">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
            {item.ironingStatus === IroningStatus.NEEDS_IRONING && (
                <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold mt-1">Needs Ironing</p>
            )}
        </div>
    </div>
);


export const OutfitHelperView: React.FC<OutfitHelperViewProps> = ({ wardrobe, aiFeaturesEnabled }) => {
    const [occasion, setOccasion] = useState('');
    const [suggestion, setSuggestion] = useState<OutfitSuggestion | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGetSuggestion = useCallback(async () => {
        if (!occasion.trim()) {
            setError('Please enter an occasion.');
            return;
        }
        setLoading(true);
        setError(null);
        setSuggestion(null);

        try {
            const result = await getOutfitSuggestion(occasion, wardrobe);
            setSuggestion(result);
        } catch (e) {
            setError('Failed to get suggestion. Please check your API key and try again.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [occasion, wardrobe]);

    const suggestedItems = suggestion ?
        Object.values(suggestion)
            .filter(id => typeof id === 'string' && id !== suggestion.reasoning)
            .map(id => wardrobe.find(item => item.id === id))
            .filter((item): item is ClothingItem => !!item)
        : [];


    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <SparklesIcon className="mx-auto h-16 w-16 text-indigo-500" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Outfit Helper</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Describe an occasion, and I'll suggest an outfit from your available items!</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg dark:border dark:border-gray-700">
                 {!aiFeaturesEnabled && (
                    <div className="text-center bg-yellow-50 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-300 p-3 rounded-lg mb-4">
                        AI features are currently turned off in Settings.
                    </div>
                )}
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={occasion}
                        onChange={(e) => setOccasion(e.target.value)}
                        placeholder="e.g., 'Casual lunch with friends'"
                        className="flex-grow w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        disabled={loading || !aiFeaturesEnabled}
                    />
                    <button
                        onClick={handleGetSuggestion}
                        disabled={loading || !aiFeaturesEnabled}
                        className="w-full sm:w-auto flex justify-center items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:disabled:bg-indigo-500/50"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Thinking...
                            </>
                        ) : 'Get Suggestion'}
                    </button>
                </div>
                {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
            </div>

            {suggestion && (
                <div className="mt-10 animate-fade-in">
                     <div className="bg-indigo-50 dark:bg-indigo-500/10 border-l-4 border-indigo-500 p-4 rounded-r-lg mb-6">
                        <h3 className="font-bold text-indigo-800 dark:text-indigo-200">Stylist's Note</h3>
                        <p className="text-indigo-700 dark:text-indigo-300">{suggestion.reasoning}</p>
                    </div>

                    {suggestedItems.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                           {suggestedItems.map(item => (
                               <SuggestionCard key={item.id} item={item} />
                           ))}
                        </div>
                    ) : (
                        !loading && <p className="text-center text-gray-600 dark:text-gray-400 mt-4">{suggestion.reasoning}</p>
                    )}
                </div>
            )}
        </div>
    );
};
