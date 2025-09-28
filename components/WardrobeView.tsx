import React, { useRef, useState } from 'react';
import type { ClothingItem } from '../types';
import { ClothingItemCard } from './ClothingItemCard';
import { WardrobeIcon } from './icons/WardrobeIcon';
import { UploadCloudIcon } from './icons/UploadCloudIcon';
import { LayoutListIcon } from './icons/LayoutListIcon';
import { LayoutGridIcon } from './icons/LayoutGridIcon';
import { LaundryStatus } from '../types';
import { ClothingItemStack } from './ClothingItemStack';

interface WardrobeViewProps {
    wardrobe: ClothingItem[];
    updateItem: (item: ClothingItem) => void;
    deleteItem: (id: string) => void;
    onPlanToWear: (item: ClothingItem) => void;
    onEditItem: (item: ClothingItem) => void;
    onZipUpload: (file: File) => void;
    onMoveToLaundry: (id: string) => void;
}

export const WardrobeView: React.FC<WardrobeViewProps> = ({ wardrobe, updateItem, deleteItem, onPlanToWear, onEditItem, onZipUpload, onMoveToLaundry }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'carousel' | 'stack'>('carousel');
    
    const availableItems = wardrobe.filter(item => item.status === LaundryStatus.AVAILABLE);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            onZipUpload(event.target.files[0]);
        }
    };

    if (availableItems.length === 0) {
        return (
            <div className="text-center py-20 px-6">
                <WardrobeIcon className="mx-auto h-24 w-24 text-gray-300 dark:text-gray-600" />
                <h2 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">Your Closet is Empty</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                    Click the '+' button to add your first item, or use the 'Bulk Add' button to upload a zip file of images.
                </p>
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-6 inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-200 transition-colors dark:bg-indigo-500/20 dark:text-indigo-300 dark:hover:bg-indigo-500/30"
                >
                    <UploadCloudIcon className="h-5 w-5" />
                    Bulk Add from Zip
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".zip" className="hidden" />
            </div>
        );
    }

    const groupedItems = availableItems.reduce((acc, item) => {
        const storageKey = item.location?.storage?.trim() || 'Uncategorized';
        const containerKey = item.location?.container?.trim() || 'General';
        
        if (!acc[storageKey]) {
            acc[storageKey] = {};
        }
        if (!acc[storageKey][containerKey]) {
            acc[storageKey][containerKey] = [];
        }
        acc[storageKey][containerKey].push(item);
        return acc;
    }, {} as Record<string, Record<string, ClothingItem[]>>);

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Items</h1>
                 <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-lg bg-gray-200 dark:bg-gray-700 p-1">
                        <button onClick={() => setViewMode('carousel')} className={`p-2 rounded-md transition-colors ${viewMode === 'carousel' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600/50'}`}><LayoutListIcon className="h-5 w-5"/></button>
                        <button onClick={() => setViewMode('stack')} className={`p-2 rounded-md transition-colors ${viewMode === 'stack' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600/50'}`}><LayoutGridIcon className="h-5 w-5" /></button>
                    </div>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-200 transition-colors dark:bg-indigo-500/20 dark:text-indigo-300 dark:hover:bg-indigo-500/30"
                    >
                        <UploadCloudIcon className="h-5 w-5" />
                        Bulk Add
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".zip" className="hidden" />
                 </div>
            </div>

            <div className="space-y-8">
                {Object.entries(groupedItems).sort(([a], [b]) => a.localeCompare(b)).map(([storage, containers]) => (
                    <details key={storage} className="group bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm dark:shadow-none dark:border dark:border-gray-700" open>
                        <summary className="list-none cursor-pointer flex items-center justify-between">
                            <div className="flex items-center">
                                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{storage}</h2>
                                <span className="ml-3 bg-gray-200 text-gray-700 text-sm font-medium px-2.5 py-0.5 rounded-full dark:bg-gray-600 dark:text-gray-200">
                                    {Object.values(containers).flat().length}
                                </span>
                            </div>
                            <div className="text-gray-400 dark:text-gray-500 group-open:rotate-90 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </summary>
                        <div className="mt-6 space-y-6">
                            {Object.entries(containers).sort(([a], [b]) => a.localeCompare(b)).map(([container, items]) => (
                                <div key={container}>
                                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-2 mb-4">{container}</h3>
                                    {viewMode === 'carousel' ? (
                                        <div className="flex overflow-x-auto gap-6 pb-4 -mx-4 px-4 horizontal-scroll">
                                            {items.map(item => (
                                                <div key={item.id} className="w-64 flex-shrink-0">
                                                    <ClothingItemCard item={item} onUpdate={updateItem} onDelete={deleteItem} onPlanToWear={onPlanToWear} onEdit={onEditItem} onMoveToLaundry={onMoveToLaundry} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <ClothingItemStack items={items} onUpdate={updateItem} onDelete={deleteItem} onPlanToWear={onPlanToWear} onEdit={onEditItem} onMoveToLaundry={onMoveToLaundry} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </details>
                ))}
            </div>
        </div>
    );
};
