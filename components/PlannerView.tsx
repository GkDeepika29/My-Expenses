import React, { useState, useMemo } from 'react';
import type { PlannedOutfits, ClothingItem, WornLogEntry } from '../types';
import { CalendarIcon } from './icons/CalendarIcon';
import { CalendarPicker } from './CalendarPicker';

interface PlannerViewProps {
    plannedOutfits: PlannedOutfits;
    wearLog: WornLogEntry[];
    wardrobe: ClothingItem[];
    onSelectDate: (date: Date) => void;
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

    const todayString = getLocalDateString(today);
    const tomorrowString = getLocalDateString(tomorrow);
    const yesterdayString = getLocalDateString(yesterday);
    const dateString = getLocalDateString(date);

    if (dateString === todayString) return 'Today';
    if (dateString === tomorrowString) return 'Tomorrow';
    if (dateString === yesterdayString) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });
};

export const PlannerView: React.FC<PlannerViewProps> = ({ plannedOutfits, wearLog, wardrobe, onSelectDate }) => {
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    });
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const wardrobeMap = useMemo(() => new Map(wardrobe.map(item => [item.id, item])), [wardrobe]);
    
    const wearLogMap = useMemo(() => {
        const map = new Map<string, string[]>();
        wearLog.forEach(entry => {
            const date = new Date(entry.date);
            const dateString = getLocalDateString(date);
            if (!map.has(dateString)) {
                map.set(dateString, []);
            }
            map.get(dateString)!.push(entry.itemId);
        });
        return map;
    }, [wearLog]);

    const changeDay = (offset: number) => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + offset);
            return newDate;
        });
    };
    
    const handleDateSelect = (date: Date) => {
        date.setHours(0,0,0,0);
        setSelectedDate(date);
        setIsCalendarOpen(false);
    };

    const todayString = getLocalDateString(new Date());
    const selectedDateString = getLocalDateString(selectedDate);
    const isPast = selectedDateString < todayString;

    const plan = plannedOutfits[selectedDateString];
    // For past days, the definitive source is the wear log. For today and future, it's the plan.
    const itemIds = isPast 
        ? (wearLogMap.get(selectedDateString) || []) 
        : (plan?.itemIds || []);
    
    // Notes are only relevant for planned outfits (today and future)
    const note = !isPast ? plan?.note : undefined;
        
    const itemsForDay = Array.from(new Set(itemIds))
        .map(id => wardrobeMap.get(id))
        .filter((i): i is ClothingItem => !!i);
        
    const activeDays = useMemo(() => {
        const days = new Set<string>();
        Object.keys(plannedOutfits).forEach(day => days.add(day));
        wearLog.forEach(log => days.add(getLocalDateString(new Date(log.date))));
        return Array.from(days);
    }, [plannedOutfits, wearLog]);


    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Planner</h1>
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <button onClick={() => changeDay(-1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="text-center cursor-pointer relative" onClick={() => setIsCalendarOpen(true)}>
                        <h2 className="text-xl font-semibold w-48 sm:w-64">{formatDate(selectedDate)}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedDate.toLocaleDateString('en-US', { year: 'numeric' })}</p>
                         {isCalendarOpen && (
                            <CalendarPicker
                                selectedDate={selectedDate}
                                onDateSelect={handleDateSelect}
                                onClose={() => setIsCalendarOpen(false)}
                                activeDays={activeDays}
                            />
                        )}
                    </div>
                    <button onClick={() => changeDay(1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:border dark:border-gray-700 min-h-[400px] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{isPast ? 'You Wore' : 'Planned Outfit'}</h3>
                    <button 
                        onClick={() => onSelectDate(selectedDate)}
                        className="bg-indigo-100 text-indigo-700 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-200 transition-colors dark:bg-indigo-500/20 dark:text-indigo-300 dark:hover:bg-indigo-500/30"
                    >
                        {itemsForDay.length > 0 ? (isPast ? 'View Details' : 'Edit Plan') : 'Plan Outfit'}
                    </button>
                </div>
                {note && (
                    <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-md border-l-4 border-gray-300 dark:border-gray-600">
                        <p className="text-sm text-gray-700 dark:text-gray-300 italic">{note}</p>
                    </div>
                )}
                {itemsForDay.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {itemsForDay.map(item => (
                            <div key={item.id} className="text-center">
                                <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover rounded-lg shadow-sm" />
                                <p className="mt-2 text-sm font-semibold truncate">{item.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.category}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
                        <CalendarIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                        <p>{isPast ? 'No outfit was logged for this day.' : 'No outfit planned for this day.'}</p>
                        <p className="text-xs mt-1">Click "Plan Outfit" to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
