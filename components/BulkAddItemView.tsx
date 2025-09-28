import React, { useState, useEffect } from 'react';
import type { UnprocessedItem, ClothingItem, ClothingItemLocation } from '../types';
import { Occasion, LaundryStatus, IroningStatus } from '../types';
import { categorizeImage, getDominantColor } from '../services/geminiService';

interface BulkAddItemViewProps {
    items: UnprocessedItem[];
    onSave: (items: Omit<ClothingItem, 'id'>[]) => void;
    onCancel: () => void;
    categories: string[];
    aiFeaturesEnabled: boolean;
}

type AIStatus = 'idle' | 'loading' | 'done' | 'error' | 'disabled';

const defaultItemData = (category: string) => ({
    name: '',
    category: category,
    occasions: [] as Occasion[],
    location: { storage: '', container: '', subContainer: '' } as ClothingItemLocation,
    laundryInstructions: '',
    status: LaundryStatus.AVAILABLE,
    ironingStatus: IroningStatus.IRONED,
    dominantColor: '#808080',
});

export const BulkAddItemView: React.FC<BulkAddItemViewProps> = ({ items, onSave, onCancel, categories, aiFeaturesEnabled }) => {
    const [itemsData, setItemsData] = useState(() =>
        items.map(item => ({
            ...defaultItemData(categories[0] || 'Top'),
            imageUrl: item.imageUrl,
            name: item.originalName.split('.').slice(0, -1).join('.').replace(/[-_]/g, ' '),
        }))
    );
    const [aiStatus, setAiStatus] = useState<Record<number, { cat: AIStatus, color: AIStatus }>>({});

    useEffect(() => {
        if (aiFeaturesEnabled) {
            items.forEach((item, index) => {
                setAiStatus(prev => ({ ...prev, [index]: { cat: 'loading', color: 'loading' } }));
                
                const categorizationPromise = categorizeImage(item.imageUrl, categories);
                const colorPromise = getDominantColor(item.imageUrl);

                categorizationPromise
                    .then(suggestedCategory => {
                        handleItemChange(index, 'category', suggestedCategory);
                        setAiStatus(prev => ({ ...prev, [index]: { ...prev[index], cat: 'done' } }));
                    })
                    .catch(() => {
                        setAiStatus(prev => ({ ...prev, [index]: { ...prev[index], cat: 'error' } }));
                    });
                
                colorPromise
                    .then(color => {
                        handleItemChange(index, 'dominantColor', color);
                        setAiStatus(prev => ({ ...prev, [index]: { ...prev[index], color: 'done' } }));
                    })
                    .catch(() => {
                        setAiStatus(prev => ({ ...prev, [index]: { ...prev[index], color: 'error' } }));
                    });
            });
        } else {
             items.forEach((_, index) => {
                setAiStatus(prev => ({ ...prev, [index]: { cat: 'disabled', color: 'disabled' } }));
             });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, categories, aiFeaturesEnabled]);

    const handleItemChange = (index: number, field: string, value: any) => {
        setItemsData(prevItems => {
            const newItemsData = [...prevItems];
            const itemToUpdate = { ...newItemsData[index] };

            if (field.startsWith('location.')) {
                const locField = field.split('.')[1] as keyof ClothingItemLocation;
                itemToUpdate.location = { ...itemToUpdate.location, [locField]: value };
            } else {
                (itemToUpdate as any)[field] = value;
            }
            newItemsData[index] = itemToUpdate;
            return newItemsData;
        });
    };
    
    const handleOccasionChange = (index: number, occasion: Occasion) => {
        const currentOccasions = itemsData[index].occasions;
        const newOccasions = currentOccasions.includes(occasion)
            ? currentOccasions.filter(o => o !== occasion)
            : [...currentOccasions, occasion];
        handleItemChange(index, 'occasions', newOccasions);
    };

    const handleSubmit = () => {
        // Validation now only checks for a name.
        for (const item of itemsData) {
            if (!item.name.trim()) {
                alert(`Please make sure every item has a name.`);
                return;
            }
        }
        
        const itemsToSave = itemsData.map(item => {
            const { location, ...rest } = item;
            const newItem: Omit<ClothingItem, 'id'> = { ...rest };
            // Only add location if it has been filled out
            if (location.storage && location.container) {
                newItem.location = location;
            }
            return newItem;
        });

        onSave(itemsToSave);
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bulk Add Items</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Add details for your uploaded images. ({items.length} items)</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">Save All Items</button>
                </div>
            </div>

            <div className="space-y-6">
                {itemsData.map((item, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm dark:border dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="relative md:col-span-1">
                            <img src={item.imageUrl} alt={`Item ${index + 1}`} className="w-full h-64 object-cover rounded-md" />
                            <div className="absolute top-2 right-2 h-6 w-6 rounded-full border-2 border-white shadow-lg dark:border-gray-800" style={{ backgroundColor: item.dominantColor }}></div>
                        </div>
                        
                        <div className="md:col-span-2 space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Name*</label>
                                <input type="text" value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" required/>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category {aiStatus[index]?.cat === 'loading' ? '(AI Suggesting...)' : ''}</label>
                                {aiStatus[index]?.cat === 'loading' ? (
                                     <div className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">Categorizing...</div>
                                ) : (
                                    <select value={item.category} onChange={e => handleItemChange(index, 'category', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                )}
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location (Optional)</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input type="text" value={item.location.storage} onChange={e => handleItemChange(index, 'location.storage', e.target.value)} placeholder="Storage (e.g., Suitcase)" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                    <input type="text" value={item.location.container} onChange={e => handleItemChange(index, 'location.container', e.target.value)} placeholder="Container (e.g., Zipper)" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                    <input type="text" value={item.location.subContainer} onChange={e => handleItemChange(index, 'location.subContainer', e.target.value)} placeholder="Sub-Container (Optional)" className="w-full px-3 py-2 border border-gray-300 rounded-md sm:col-span-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Suitable Occasions</label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.values(Occasion).map(occ => (
                                        <button type="button" key={occ} onClick={() => handleOccasionChange(index, occ)} className={`px-2 py-1 text-xs rounded-full border transition-colors ${item.occasions.includes(occ) ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-600'}`}>
                                            {occ}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};