import React, { useState, useMemo } from 'react';

interface CalendarPickerProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    onClose: () => void;
    activeDays: string[];
}

const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const CalendarPicker: React.FC<CalendarPickerProps> = ({ selectedDate, onDateSelect, onClose, activeDays }) => {
    const [viewDate, setViewDate] = useState(new Date(selectedDate));

    const changeMonth = (offset: number) => {
        setViewDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };
    
    const goToToday = () => {
        const today = new Date();
        today.setHours(0,0,0,0);
        setViewDate(today);
        onDateSelect(today);
    }

    const daysInMonth = useMemo(() => {
        const date = new Date(viewDate);
        const year = date.getFullYear();
        const month = date.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const days = [];
        // Add padding for days from previous month
        for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
            days.push(null);
        }
        // Add days of the current month
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    }, [viewDate]);

    const todayString = getLocalDateString(new Date());
    const selectedDateString = getLocalDateString(selectedDate);
    const activeDaysSet = new Set(activeDays);
    
    const handleOverlayClick = (e: React.MouseEvent) => {
        // We stop propagation to prevent the click from bubbling up to the PlannerView
        // which would cause the calendar to re-open immediately.
        e.stopPropagation();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-25 dark:bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={handleOverlayClick}>
            <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-xs p-4 animate-fade-in relative"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                     <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                        {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </div>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>

                <button onClick={onClose} className="absolute top-2 right-2 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day}>{day}</div>)}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {daysInMonth.map((day, index) => {
                        if (!day) return <div key={`empty-${index}`} />;
                        
                        const dayString = getLocalDateString(day);
                        const isSelected = dayString === selectedDateString;
                        const isToday = dayString === todayString;
                        const isActive = activeDaysSet.has(dayString);

                        return (
                            <div key={dayString} className="relative">
                                <button
                                    onClick={() => onDateSelect(day)}
                                    className={`
                                        w-9 h-9 flex items-center justify-center rounded-full transition-colors text-sm
                                        ${isSelected ? 'bg-indigo-600 text-white font-bold' : ''}
                                        ${!isSelected && isToday ? 'bg-gray-200 dark:bg-gray-600' : ''}
                                        ${!isSelected && !isToday ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                                        ${!isSelected ? 'text-gray-700 dark:text-gray-200' : ''}
                                    `}
                                >
                                    {day.getDate()}
                                </button>
                                {isActive && (
                                     <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`}></div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
                    <button 
                        onClick={goToToday}
                        className="w-full text-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 py-2 rounded-md transition-colors"
                    >
                        Go to Today
                    </button>
                </div>
            </div>
        </div>
    );
};