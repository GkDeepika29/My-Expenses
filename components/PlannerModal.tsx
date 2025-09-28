import React, { useState, useMemo, useEffect } from 'react';
import type { ClothingItem, WornLogEntry, PlannedOutfits, AppSettings } from '../types';
import { LaundryStatus, IroningStatus } from '../types';
import { CalendarPicker } from './CalendarPicker';
import { CalendarIcon } from './icons/CalendarIcon';

interface PlannerModalProps {
    date: Date;
    wardrobe: ClothingItem[];
    wearLog: WornLogEntry[];
    initialSelectedItem: ClothingItem | null;
    plannedOutfits: PlannedOutfits;
    onClose: () => void;
    onSave: (date: Date, itemIds: string[], note: string) => void;
    appSettings: AppSettings;
}

// Utility to get a timezone-safe YYYY-MM-DD string from a Date object
const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatDate = (date: Date): string => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (getLocalDateString(date) === getLocalDateString(today)) return 'Today';
    if (getLocalDateString(date) === getLocalDateString(tomorrow)) return 'Tomorrow';
    if (getLocalDateString(date) === getLocalDateString(yesterday)) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
};


const ItemGridCard: React.FC<{ item: ClothingItem, isSelected?: boolean, onToggle?: (id: string) => void, readOnly?: boolean }> = ({ item, isSelected, onToggle, readOnly }) => {
    return (
        <div 
            onClick={!readOnly && onToggle ? () => onToggle(item.id) : undefined} 
            className={`${!readOnly ? 'cursor-pointer' : ''} rounded-lg overflow-hidden border-2 transition-all ${isSelected ? 'border-indigo-500 shadow-lg' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}
        >
            <div className="relative">
                <img src={item.imageUrl} alt={item.name} className="h-32 w-full object-cover"/>
                 {item.ironingStatus === IroningStatus.NEEDS_IRONING && !readOnly && (
                    <div className="absolute top-1 right-1 bg-orange-100 text-orange-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full dark:bg-orange-500/30 dark:text-orange-300" title="Needs Ironing">
                        Needs Ironing
                    </div>
                )}
                {isSelected && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-700">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.category}</p>
            </div>
        </div>
    );
};


export const PlannerModal: React.FC<PlannerModalProps> = ({ date: initialDate, wardrobe, wearLog, initialSelectedItem, plannedOutfits, onClose, onSave, appSettings }) => {
    
    const [currentDate, setCurrentDate] = useState(initialDate);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [note, setNote] = useState('');
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // Effect to load data from props when the date changes. This is the single source of truth for saved data.
    useEffect(() => {
        const dateStr = getLocalDateString(currentDate);
        const plannedOutfit = plannedOutfits[dateStr];
        setSelectedIds(new Set(plannedOutfit?.itemIds || []));
        setNote(plannedOutfit?.note || '');
    }, [currentDate, plannedOutfits]);

    // Effect to handle the initial item passed via props. This runs ONLY ONCE when the modal is first opened.
    useEffect(() => {
        if (initialSelectedItem) {
            const item = initialSelectedItem;
            // Only process if the modal is still on the initial date.
            if (getLocalDateString(currentDate) === getLocalDateString(initialDate)) {
                // Check if it's an available item and not already part of the plan.
                if (item.status === LaundryStatus.AVAILABLE && !selectedIds.has(item.id)) {
                    // Pre-confirm "needs ironing" items.
                    if (item.ironingStatus === IroningStatus.NEEDS_IRONING) {
                        if (window.confirm(`'${item.name}' needs ironing. Do you still want to add it to your plan?`)) {
                            setSelectedIds(prevIds => new Set(prevIds).add(item.id));
                        }
                    } else {
                        // Add non-ironing items directly.
                        setSelectedIds(prevIds => new Set(prevIds).add(item.id));
                    }
                }
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array ensures this runs only ONCE after the initial render.

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);
    const dateString = getLocalDateString(currentDate);
    const isPastDate = dateString < getLocalDateString(today);

    const handleToggleItem = (itemId: string) => {
        const item = wardrobe.find(i => i.id === itemId);
        // Do not allow changes for past dates or unavailable items.
        if (!item || isPastDate || item.status !== LaundryStatus.AVAILABLE) {
            return;
        }

        const isCurrentlySelected = selectedIds.has(itemId);

        if (isCurrentlySelected) {
            // If it's already selected, just remove it. No confirmation needed.
            setSelectedIds(prevIds => {
                const newIds = new Set(prevIds);
                newIds.delete(itemId);
                return newIds;
            });
        } else {
            // If we are adding a new item, check if it needs ironing.
            if (item.ironingStatus === IroningStatus.NEEDS_IRONING) {
                if (window.confirm(`'${item.name}' needs ironing. Do you still want to add it to your plan?`)) {
                    // Add after user confirmation.
                    setSelectedIds(prevIds => new Set(prevIds).add(itemId));
                }
            } else {
                // Add directly if no ironing is needed.
                setSelectedIds(prevIds => new Set(prevIds).add(itemId));
            }
        }
    };
    
    const yesterday = useMemo(() => new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1), [today]);
    const tomorrow = useMemo(() => new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1), [today]);
    
    const dateOptions = useMemo(() => [
        { label: 'Yesterday', date: yesterday },
        { label: 'Today', date: today },
        { label: 'Tomorrow', date: tomorrow },
    ], [yesterday, today, tomorrow]);


    const wardrobeMap = useMemo(() => new Map(wardrobe.map(item => [item.id, item])), [wardrobe]);
    
    const wornItemsOnDate = useMemo(() => {
        const wornIds = wearLog
            .filter(log => getLocalDateString(new Date(log.date)) === dateString)
            .map(log => log.itemId);
        return Array.from(new Set(wornIds))
            .map(id => wardrobeMap.get(id))
            .filter((i): i is ClothingItem => !!i);
    }, [dateString, wearLog, wardrobeMap]);

    const availableItems = wardrobe.filter(
        item => item.status === LaundryStatus.AVAILABLE
    );

    
    const handleSubmit = () => {
        if (!isPastDate && selectedIds.size > 0) {
            onSave(currentDate, Array.from(selectedIds), note);
        }
    };

    const handleDateSelectFromPicker = (date: Date) => {
        setCurrentDate(date);
        setIsCalendarOpen(false);
    };
    
    const activeDaysForCalendar = useMemo(() => {
        const days = new Set<string>();
        Object.keys(plannedOutfits).forEach(day => days.add(day));
        wearLog.forEach(log => days.add(getLocalDateString(new Date(log.date))));
        return Array.from(days);
    }, [plannedOutfits, wearLog]);
    
    const plannedOutfitForCurrentDate = plannedOutfits[dateString];

    const renderContent = () => {
        if (isPastDate) {
             const pastPlan = plannedOutfitForCurrentDate;
             const pastNote = pastPlan?.note;
            return (
                <div>
                    {pastNote && (
                         <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-md">
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Note from when this was planned:</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 italic">{pastNote}</p>
                        </div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">You wore:</h3>
                    {wornItemsOnDate.length === 0 ? (
                         <p className="text-gray-500 dark:text-gray-400 text-center py-10">No items were logged for this day.</p>
                    ) : (
                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {wornItemsOnDate.map(item => <ItemGridCard key={item.id} item={item} readOnly />)}
                         </div>
                    )}
                </div>
            );
        }

        return (
             <>
                <div className="mb-4">
                    <label htmlFor="planner-note" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note (optional)</label>
                    <input 
                        type="text" 
                        id="planner-note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="e.g., Dinner with friends"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        disabled={isPastDate}
                    />
                </div>
                {availableItems.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-10">No clean items are available to plan with.</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {availableItems.map(item => (
                            <ItemGridCard 
                                key={item.id} 
                                item={item} 
                                isSelected={selectedIds.has(item.id)}
                                onToggle={handleToggleItem}
                                readOnly={isPastDate}
                            />
                        ))}
                    </div>
                )}
            </>
        );
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-gray-700">
                     <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{isPastDate ? 'Outfit History' : 'Plan Outfit'}</h2>
                        <div className="flex items-center gap-2">
                             <div className="flex items-center rounded-lg bg-gray-200 dark:bg-gray-700 p-1">
                                 {dateOptions.map(({ label, date }) => {
                                     const isSelected = getLocalDateString(date) === dateString;
                                     return (
                                         <button
                                             key={label}
                                             onClick={() => setCurrentDate(date)}
                                             className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors w-24 ${
                                                 isSelected 
                                                     ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-700 dark:text-white' 
                                                     : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600/50'
                                             }`}
                                         >
                                             {label}
                                         </button>
                                     );
                                 })}
                             </div>
                              <button
                                onClick={() => setIsCalendarOpen(true)}
                                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                aria-label="Select a date from the calendar"
                                title="Select Date"
                             >
                                <CalendarIcon className="h-5 w-5" />
                             </button>
                        </div>
                    </div>
                     <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2 sm:hidden">
                        {formatDate(currentDate)}
                     </p>
                </div>
                
                {isCalendarOpen && (
                    <CalendarPicker
                        selectedDate={currentDate}
                        onDateSelect={handleDateSelectFromPicker}
                        onClose={() => setIsCalendarOpen(false)}
                        activeDays={activeDaysForCalendar}
                    />
                )}

                <div className="p-6 flex-grow overflow-y-auto">
                   {renderContent()}
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-end space-x-3 border-t dark:border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        {isPastDate ? 'Close' : 'Cancel'}
                    </button>
                    {!isPastDate && (
                         <button 
                            type="button" 
                            onClick={handleSubmit} 
                            disabled={selectedIds.size === 0}
                            className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                         >
                            {plannedOutfitForCurrentDate?.itemIds && plannedOutfitForCurrentDate.itemIds.length > 0 ? 'Update Plan' : 'Save Plan'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
