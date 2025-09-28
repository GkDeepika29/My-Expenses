import React from 'react';
import type { WornLogEntry, ClothingItem } from '../types';
import { ChartBarIcon } from './icons/ChartBarIcon';

interface InsightsViewProps {
    wearLog: WornLogEntry[];
    wardrobe: ClothingItem[];
}

export const InsightsView: React.FC<InsightsViewProps> = ({ wearLog, wardrobe }) => {
    const wearCounts = wearLog.reduce((acc, log) => {
        acc[log.itemId] = (acc[log.itemId] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const wardrobeMap = new Map(wardrobe.map(item => [item.id, item]));

    const sortedItems = Object.entries(wearCounts)
        .map(([itemId, count]) => ({
            item: wardrobeMap.get(itemId),
            count: count,
        }))
        // Fix: Add a type predicate to the filter to properly narrow the type of the array elements.
        // This resolves errors related to sorting and accessing properties on 'item'.
        .filter((entry): entry is { item: ClothingItem; count: number } => !!entry.item)
        .sort((a, b) => b.count - a.count);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <ChartBarIcon className="mx-auto h-16 w-16 text-indigo-500" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Wardrobe Insights</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Discover your most-worn items and understand your style better.</p>
            </div>

            {sortedItems.length === 0 ? (
                <div className="text-center bg-white dark:bg-gray-800 p-10 rounded-lg shadow-sm dark:border dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-400">No wear history yet. Plan outfits in the Planner, and your insights will appear here after you've worn them!</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:border dark:border-gray-700 overflow-hidden">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {sortedItems.map(({ item, count }, index) => item && (
                            <li key={item.id} className="p-4 flex items-center space-x-4">
                                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 w-8 text-center">{index + 1}</span>
                                <img src={item.imageUrl} alt={item.name} className="h-16 w-16 rounded-md object-cover" />
                                <div className="flex-grow">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{item.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{count}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-right">wears</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};