import React, { useState, useEffect } from 'react';
import type { InventoryItem, ClothingItemLocation } from '../types';

interface InventoryItemModalProps {
    onClose: () => void;
    onSave: (item: Omit<InventoryItem, 'id'> | InventoryItem) => void;
    itemToEdit?: InventoryItem | null;
}

export const InventoryItemModal: React.FC<InventoryItemModalProps> = ({ onClose, onSave, itemToEdit }) => {
    const [itemData, setItemData] = useState<Omit<InventoryItem, 'id'>>({
        name: '',
        category: '',
        location: { storage: '', container: '', subContainer: '' },
        notes: '',
    });

    const isEditing = !!itemToEdit;

    useEffect(() => {
        if (isEditing) {
            setItemData(itemToEdit);
        }
    }, [isEditing, itemToEdit]);
    
    const handleInputChange = (field: keyof Omit<InventoryItem, 'id'>, value: any) => {
        setItemData(prev => ({ ...prev, [field]: value }));
    };

    const handleLocationChange = (field: keyof ClothingItemLocation, value: string) => {
        setItemData(prev => ({
            ...prev,
            location: {
                ...(prev.location || { storage: '', container: ''}),
                [field]: value,
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemData.name) {
            alert('Please provide a name for the item.');
            return;
        }
        
        const finalItemData = { ...itemData };
        // Only include location if it's filled out
        if (!finalItemData.location?.storage || !finalItemData.location?.container) {
            delete finalItemData.location;
        }

        if (isEditing) {
            onSave({ ...finalItemData, id: itemToEdit.id });
        } else {
            onSave(finalItemData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{isEditing ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h2>
                        
                        <div className="space-y-4">
                             <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Name*</label>
                                <input type="text" id="name" value={itemData.name} onChange={e => handleInputChange('name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                            </div>

                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                <input type="text" id="category" value={itemData.category} onChange={e => handleInputChange('category', e.target.value)} placeholder="e.g., Toiletries, Jewellery" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Location Details (Optional)</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     <div>
                                        <label htmlFor="storage" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Storage</label>
                                        <input type="text" id="storage" value={itemData.location?.storage || ''} onChange={e => handleLocationChange('storage', e.target.value)} placeholder="e.g., Bathroom cabinet" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                     </div>
                                      <div>
                                        <label htmlFor="container" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Container</label>
                                        <input type="text" id="container" value={itemData.location?.container || ''} onChange={e => handleLocationChange('container', e.target.value)} placeholder="e.g., Top drawer" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                     </div>
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                                <textarea id="notes" value={itemData.notes} onChange={e => handleInputChange('notes', e.target.value)} rows={3} placeholder="e.g., Expiry date, purchase location" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                            {isEditing ? 'Save Changes' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
