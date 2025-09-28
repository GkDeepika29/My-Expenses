import React, { useState, useEffect } from 'react';
import type { ClothingItem, ClothingItemLocation } from '../types';
import { Occasion, LaundryStatus, IroningStatus, DEFAULT_CATEGORIES } from '../types';
import { categorizeImage, getDominantColor } from '../services/geminiService';

interface ItemDetailsModalProps {
    onClose: () => void;
    onSave: (item: Omit<ClothingItem, 'id'> | ClothingItem) => void;
    itemToEdit?: ClothingItem | null;
    categories: string[];
    aiFeaturesEnabled: boolean;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({ onClose, onSave, itemToEdit, categories, aiFeaturesEnabled }) => {
    const [itemData, setItemData] = useState<Omit<ClothingItem, 'id'>>({
        name: '',
        category: categories[0] || DEFAULT_CATEGORIES[0],
        occasions: [],
        location: { storage: '', container: '', subContainer: '' },
        imageUrl: '',
        laundryInstructions: '',
        status: LaundryStatus.AVAILABLE,
        ironingStatus: IroningStatus.IRONED,
        dominantColor: '#808080'
    });
    
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isAiProcessing, setIsAiProcessing] = useState(false);

    const isEditing = !!itemToEdit;

    useEffect(() => {
        if (isEditing) {
            setItemData(itemToEdit);
            setImagePreview(itemToEdit.imageUrl);
        }
    }, [isEditing, itemToEdit]);
    
    const handleInputChange = (field: keyof Omit<ClothingItem, 'id'>, value: any) => {
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

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImagePreview(URL.createObjectURL(file));
            const base64Image = await fileToBase64(file);
            handleInputChange('imageUrl', base64Image);
            
            if (aiFeaturesEnabled) {
                setIsAiProcessing(true);
                try {
                    // Run AI tasks in parallel
                    const [category, color] = await Promise.all([
                        categorizeImage(base64Image, categories),
                        getDominantColor(base64Image)
                    ]);
                    setItemData(prev => ({...prev, category, dominantColor: color }));
                } catch (error) {
                    console.error("Error during AI processing:", error);
                } finally {
                    setIsAiProcessing(false);
                }
            }
        }
    };

    const handleOccasionChange = (occasion: Occasion) => {
        const newOccasions = itemData.occasions.includes(occasion)
            ? itemData.occasions.filter(o => o !== occasion)
            : [...itemData.occasions, occasion];
        handleInputChange('occasions', newOccasions);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemData.name || !itemData.imageUrl) {
            alert('Please provide a name and an image for the item.');
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{isEditing ? 'Edit Item' : 'Add New Item'}</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div className="md:col-span-2">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Name*</label>
                                <input type="text" id="name" value={itemData.name} onChange={e => handleInputChange('name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                            </div>

                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                <select id="category" value={itemData.category} onChange={e => handleInputChange('category', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={isAiProcessing}>
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>

                            <div className="flex items-end gap-2">
                                <div className="flex-grow">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image*</label>
                                    <div className="mt-1 flex justify-center px-4 py-3 border-2 border-gray-300 border-dashed rounded-md dark:border-gray-600">
                                        <div className="space-y-1 text-center">
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="mx-auto h-20 w-20 object-cover rounded-md" />
                                            ) : (
                                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                            <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                                    <span>{isAiProcessing ? 'Processing...' : 'Upload an image'}</span>
                                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" disabled={isAiProcessing} />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                 <div className="flex flex-col items-center">
                                    <label htmlFor="dominantColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                                    <input type="color" id="dominantColor" value={itemData.dominantColor} onChange={e => handleInputChange('dominantColor', e.target.value)} className="w-12 h-12 p-1 border border-gray-300 rounded-md cursor-pointer dark:border-gray-600" />
                                 </div>
                            </div>

                            <div className="md:col-span-2">
                                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">Location Details (Optional)</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     <div>
                                        <label htmlFor="storage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Storage (e.g., Suitcase, Bag)</label>
                                        <input type="text" id="storage" value={itemData.location?.storage || ''} onChange={e => handleLocationChange('storage', e.target.value)} placeholder="Large blue suitcase" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                     </div>
                                      <div>
                                        <label htmlFor="container" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Container (e.g., Zipper)</label>
                                        <input type="text" id="container" value={itemData.location?.container || ''} onChange={e => handleLocationChange('container', e.target.value)} placeholder="Main compartment" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                     </div>
                                      <div className="sm:col-span-2">
                                        <label htmlFor="subContainer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sub-Container</label>
                                        <input type="text" id="subContainer" value={itemData.location?.subContainer || ''} onChange={e => handleLocationChange('subContainer', e.target.value)} placeholder="Left mesh pocket" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                     </div>
                                </div>
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Suitable Occasions</label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.values(Occasion).map(occ => (
                                        <button type="button" key={occ} onClick={() => handleOccasionChange(occ)} className={`px-3 py-1 text-sm rounded-full border transition-colors ${itemData.occasions.includes(occ) ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-600'}`}>
                                            {occ}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="laundry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Laundry Instructions</label>
                                <textarea id="laundry" value={itemData.laundryInstructions} onChange={e => handleInputChange('laundryInstructions', e.target.value)} rows={2} placeholder="e.g., Machine wash cold, hang dry" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600" disabled={isAiProcessing}>
                            {isEditing ? 'Save Changes' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};