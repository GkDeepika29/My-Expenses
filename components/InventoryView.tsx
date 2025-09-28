import React from 'react';
import type { InventoryItem } from '../types';
import { InventoryItemCard } from './InventoryItemCard';
import { BoxIcon } from './icons/BoxIcon';

interface InventoryViewProps {
    inventory: InventoryItem[];
    onEditItem: (item: InventoryItem) => void;
    onDeleteItem: (id: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ inventory, onEditItem, onDeleteItem }) => {
    if (inventory.length === 0) {
        return (
            <div className="text-center py-20 px-6">
                <BoxIcon className="mx-auto h-24 w-24 text-gray-300 dark:text-gray-600" />
                <h2 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">Your Inventory is Empty</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                    Click the '+' button to add your first item to the inventory.
                </p>
            </div>
        );
    }

    const groupedItems = inventory.reduce((acc, item) => {
        const categoryKey = item.category?.trim() || 'Uncategorized';
        if (!acc[categoryKey]) {
            acc[categoryKey] = [];
        }
        acc[categoryKey].push(item);
        return acc;
    }, {} as Record<string, InventoryItem[]>);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Inventory</h1>
            </div>

            <div className="space-y-8">
                {/* FIX: Explicitly typing `[category, items]` to resolve a TypeScript inference issue where `items` was being typed as `unknown`. */}
                {Object.entries(groupedItems).sort(([a], [b]) => a.localeCompare(b)).map(([category, items]: [string, InventoryItem[]]) => (
                    <div key={category}>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">{category}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {items.map(item => (
                                <InventoryItemCard
                                    key={item.id}
                                    item={item}
                                    onEdit={onEditItem}
                                    onDelete={onDeleteItem}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};