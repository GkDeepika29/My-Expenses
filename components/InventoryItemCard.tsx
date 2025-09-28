import React from 'react';
import type { InventoryItem } from '../types';
import { EditIcon } from './icons/EditIcon';

interface InventoryItemCardProps {
    item: InventoryItem;
    onEdit: (item: InventoryItem) => void;
    onDelete: (id: string) => void;
}

export const InventoryItemCard: React.FC<InventoryItemCardProps> = ({ item, onEdit, onDelete }) => {
    const locationString = item.location && item.location.storage ? [item.location.storage, item.location.container, item.location.subContainer].filter(Boolean).join(' > ') : 'N/A';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:border dark:border-gray-700 p-4 flex flex-col h-full">
            <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                <div className="flex items-center space-x-1">
                    <button
                        onClick={() => onEdit(item)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full dark:hover:bg-gray-700"
                        aria-label="Edit item"
                    >
                        <EditIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => onDelete(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full dark:hover:bg-gray-700"
                        aria-label="Delete item"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{item.category}</p>

            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1 mt-2">
                <p className="truncate"><strong>Location:</strong> {locationString}</p>
            </div>
            
            {item.notes && (
                 <div className="mt-3 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md flex-grow">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Notes:</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{item.notes}</p>
                </div>
            )}
        </div>
    );
};
