import React from 'react';
import type { ClothingItem, LaundryNotification } from '../types';
import { LaundryStatus } from '../types';
import { ClothingItemCard } from './ClothingItemCard';
import { WashingMachineIcon } from './icons/WashingMachineIcon';
import { LaundryItemCard } from './LaundryItemCard';

interface LaundryViewProps {
    wardrobe: ClothingItem[];
    updateItem: (item: ClothingItem) => void;
    notifications: LaundryNotification[];
    onMarkAsWashed: (categories?: string[]) => void;
    onMarkItemAsWashed: (itemId: string) => void;
    onPutAway: (itemId: string) => void;
    onEditItem: (item: ClothingItem) => void;
}

export const LaundryView: React.FC<LaundryViewProps> = ({ wardrobe, updateItem, notifications, onMarkAsWashed, onMarkItemAsWashed, onPutAway, onEditItem }) => {
    const laundryItems = wardrobe.filter(item => item.status === LaundryStatus.IN_LAUNDRY);
    const washedItems = wardrobe.filter(item => item.status === LaundryStatus.WASHED);
    
    const groupedLaundry = laundryItems.reduce((acc, item) => {
        let group: 'Whites' | 'Bedsheets' | 'Other';
        // Using string comparison for flexibility
        if (item.category === "Whites") {
            group = 'Whites';
        } else if (item.category === "Bedsheets") {
            group = 'Bedsheets';
        } else {
            group = 'Other';
        }
        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
        return acc;
    }, {} as Record<'Whites' | 'Bedsheets' | 'Other', ClothingItem[]>);

    return (
        <div>
            {notifications.length > 0 && (
                <div className="mb-6 space-y-3">
                    <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-300">Alerts</h2>
                    {notifications.map(notif => (
                        <div key={notif.id} className="bg-yellow-50 dark:bg-yellow-500/10 border-l-4 border-yellow-400 p-4 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700 dark:text-yellow-200">{notif.message}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Section for Washed Items */}
            {washedItems.length > 0 && (
                <div className="mb-12">
                     <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Clean & Ready to Put Away</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">These items are washed. Put them back in their designated spots.</p>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {washedItems.map(item => (
                            <LaundryItemCard key={item.id} item={item} onPutAway={onPutAway} onEdit={onEditItem} />
                        ))}
                    </div>
                </div>
            )}

            {/* Section for Dirty Laundry */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                 <div className="flex items-center gap-4">
                    <WashingMachineIcon className="h-10 w-10 text-indigo-600 dark:text-indigo-500" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">In Laundry Basket</h1>
                 </div>
                 {laundryItems.length > 0 && (
                     <button
                        onClick={() => onMarkAsWashed()}
                        className="w-full sm:w-auto bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600"
                     >
                        Mark All as Washed
                     </button>
                 )}
            </div>

            {laundryItems.length === 0 ? (
                <div className="text-center py-20 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:border dark:border-gray-700">
                    <WashingMachineIcon className="mx-auto h-24 w-24 text-gray-300 dark:text-gray-600" />
                    <h2 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">Laundry Basket is Empty</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        All your clothes are clean. Great job!
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {(['Whites', 'Bedsheets', 'Other'] as const).map(groupName => {
                        const items = groupedLaundry[groupName];
                        if (!items || items.length === 0) return null;

                        const categories = groupName === 'Whites' ? ["Whites"] : groupName === 'Bedsheets' ? ["Bedsheets"] : items.map(i => i.category);

                        return (
                            <div key={groupName}>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{groupName} ({items.length})</h2>
                                    <button 
                                        onClick={() => onMarkAsWashed(categories)}
                                        className="bg-green-100 text-green-800 hover:bg-green-200 text-sm font-semibold py-2 px-3 rounded-lg transition-colors dark:bg-green-500/20 dark:text-green-300 dark:hover:bg-green-500/30"
                                    >
                                        Mark All as Washed
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                    {items.map(item => (
                                        <div key={item.id} className="relative">
                                            <ClothingItemCard item={item} onUpdate={updateItem} onDelete={()=>{}} isLaundryView={true} onPlanToWear={()=>{}} onEdit={onEditItem} onMarkAsWashed={onMarkItemAsWashed} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
