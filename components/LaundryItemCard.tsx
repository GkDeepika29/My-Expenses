import React from 'react';
import type { ClothingItem } from '../types';
import { PackageCheckIcon } from './icons/PackageCheckIcon';
import { EditIcon } from './icons/EditIcon';

interface LaundryItemCardProps {
    item: ClothingItem;
    onPutAway: (itemId: string) => void;
    onEdit: (item: ClothingItem) => void;
}

export const LaundryItemCard: React.FC<LaundryItemCardProps> = ({ item, onPutAway, onEdit }) => {
    const hasLocation = item.location && item.location.storage && item.location.container;
    const locationString = hasLocation 
        ? [item.location.storage, item.location.container, item.location.subContainer].filter(Boolean).join(' > ')
        : 'No location set';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:border dark:border-gray-700 overflow-hidden flex flex-col h-full">
            <img className="h-40 w-full object-cover" src={item.imageUrl} alt={item.name} />
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                
                <div className="mt-3 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Put away in:</p>
                    <p className={`text-sm font-semibold ${hasLocation ? 'text-gray-800 dark:text-gray-200' : 'text-orange-600 dark:text-orange-400'}`}>{locationString}</p>
                </div>
                
                <div className="mt-auto pt-4">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => onPutAway(item.id)}
                            className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2 px-3 rounded-lg transition-colors bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                        >
                            <PackageCheckIcon className="h-5 w-5" />
                            {hasLocation ? 'Put Away' : 'Put Away (Uncategorized)'}
                        </button>
                        {!hasLocation && (
                             <button
                                onClick={() => onEdit(item)}
                                className="p-2 text-gray-500 hover:text-indigo-600 bg-gray-200 hover:bg-indigo-50 rounded-lg dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                                aria-label="Set location"
                                title="Set Location"
                            >
                                <EditIcon className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};