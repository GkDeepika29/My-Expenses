
import React, { useState } from 'react';
import type { ClothingItem } from '../types';

interface WearItemModalProps {
    item: ClothingItem;
    onClose: () => void;
    onLogWear: (itemId: string, date: Date) => void;
}

export const WearItemModal: React.FC<WearItemModalProps> = ({ item, onClose, onLogWear }) => {
    const getYesterday = () => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0];
    };

    const [wearDate, setWearDate] = useState(getYesterday());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (wearDate) {
            // The date from input is YYYY-MM-DD, which JS parses as UTC midnight.
            // Adding T12:00 to ensure it's parsed in the local timezone for consistency.
            onLogWear(item.id, new Date(`${wearDate}T12:00:00`));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Log Wear</h2>
                        <p className="text-gray-600 mb-4">When did you wear <span className="font-semibold">{item.name}</span>?</p>
                        
                        <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover rounded-md mb-4" />

                        <div>
                            <label htmlFor="wear-date" className="block text-sm font-medium text-gray-700 mb-1">Date Worn</label>
                            <input
                                type="date"
                                id="wear-date"
                                value={wearDate}
                                onChange={e => setWearDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Log Item</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
