import React from 'react';
import type { ClothingItem } from '../types';
import { LaundryStatus, IroningStatus } from '../types';
import { EditIcon } from './icons/EditIcon';
import { WashingMachineIcon } from './icons/WashingMachineIcon';

interface ClothingItemCardProps {
    item: ClothingItem;
    onUpdate: (item: ClothingItem) => void;
    onDelete: (id: string) => void;
    onPlanToWear: (item: ClothingItem) => void;
    onEdit: (item: ClothingItem) => void;
    onMoveToLaundry?: (id: string) => void;
    onMarkAsWashed?: (id: string) => void;
    isLaundryView?: boolean;
    isStacked?: boolean;
    isActive?: boolean;
    onClick?: () => void;
}

export const ClothingItemCard: React.FC<ClothingItemCardProps> = ({ 
    item, onUpdate, onDelete, onPlanToWear, onEdit, onMoveToLaundry, onMarkAsWashed,
    isLaundryView = false, isStacked = false, isActive = false, onClick 
}) => {
    
    const toggleIroningStatus = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newStatus = item.ironingStatus === IroningStatus.IRONED ? IroningStatus.NEEDS_IRONING : IroningStatus.IRONED;
        onUpdate({ ...item, ironingStatus: newStatus });
    };

    const handlePlanToWearClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onPlanToWear(item);
    };
    
    const locationString = item.location && item.location.storage ? [item.location.storage, item.location.container, item.location.subContainer].filter(Boolean).join(' > ') : 'N/A';

    const statusColor = {
        [LaundryStatus.AVAILABLE]: 'text-green-600 dark:text-green-400',
        [LaundryStatus.IN_LAUNDRY]: 'text-yellow-600 dark:text-yellow-400',
        [LaundryStatus.WASHED]: 'text-blue-600 dark:text-blue-400',
    };
    
    const cardContent = (
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{item.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 space-y-1">
            <p className="truncate"><strong>Location:</strong> {locationString}</p>
            <div className="flex items-center gap-2">
              <strong>Status:</strong> 
              <span className={`font-medium ${statusColor[item.status]}`}>{item.status}</span>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span 
                  onClick={!isLaundryView ? toggleIroningStatus : undefined}
                  className={`font-medium ${!isLaundryView ? 'cursor-pointer' : ''} ${item.ironingStatus === IroningStatus.IRONED ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}
              >
                  {item.ironingStatus}
              </span>
            </div>
        </div>
        {item.occasions && item.occasions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
                {item.occasions.slice(0, 3).map(occ => (
                    <span key={occ} className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 rounded-full font-medium dark:bg-indigo-500/20 dark:text-indigo-300">{occ}</span>
                ))}
            </div>
        )}
        <div className="mt-auto pt-4">
            <div className="flex items-center space-x-2">
                 {isLaundryView ? (
                     <div className="w-full flex flex-col space-y-2">
                        {item.status === LaundryStatus.IN_LAUNDRY && onMarkAsWashed && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onMarkAsWashed(item.id); }}
                                className="w-full text-sm font-semibold py-2 px-3 rounded-lg transition-colors bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-500/20 dark:text-green-300 dark:hover:bg-green-500/30 flex items-center justify-center gap-2"
                            >
                                Mark as Washed
                            </button>
                        )}
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                            className="w-full text-sm font-semibold py-2 px-3 rounded-lg transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 flex items-center justify-center gap-2"
                        >
                            <EditIcon className="h-4 w-4" /> Edit Location
                        </button>
                    </div>
                 ) : (
                    <>
                        <button
                            onClick={handlePlanToWearClick}
                            disabled={item.status !== LaundryStatus.AVAILABLE}
                            className="w-full text-sm font-semibold py-2 px-3 rounded-lg transition-colors bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:disabled:bg-gray-500"
                        >
                            Plan to Wear
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full dark:hover:bg-gray-700"
                            aria-label="Edit item"
                        >
                            <EditIcon className="h-5 w-5" />
                        </button>
                        {item.status === LaundryStatus.AVAILABLE && onMoveToLaundry && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onMoveToLaundry(item.id); }}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full dark:hover:bg-gray-700"
                                aria-label="Move to laundry"
                                title="Move to Laundry"
                            >
                                <WashingMachineIcon className="h-5 w-5" />
                            </button>
                        )}
                         <button
                            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full dark:hover:bg-gray-700"
                            aria-label="Delete item"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </>
                 )}
            </div>
        </div>
      </div>
    );

    if (isStacked) {
        return (
            <div 
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 w-full cursor-pointer`}
              onClick={(e) => {
                // Stop propagation only if the target is the root div itself, not its children (like buttons)
                if (e.target === e.currentTarget && onClick) {
                    onClick();
                }
              }}
            >
                <div className="relative h-48" onClick={onClick}>
                    <img className="h-full w-full object-cover" src={item.imageUrl} alt={item.name} />
                    {item.dominantColor && <div className="absolute bottom-2 right-2 h-5 w-5 rounded-full border-2 border-white shadow dark:border-gray-800" style={{ backgroundColor: item.dominantColor }}></div>}
                </div>
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${isActive ? 'max-h-[300px]' : 'max-h-0'}`}
                >
                    {cardContent}
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:border dark:border-gray-700 overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-indigo-500/10 flex flex-col h-full">
            <div className="relative h-48">
                <img className="h-full w-full object-cover" src={item.imageUrl} alt={item.name} />
                {item.dominantColor && <div className="absolute bottom-2 right-2 h-5 w-5 rounded-full border-2 border-white shadow dark:border-gray-800" style={{ backgroundColor: item.dominantColor }}></div>}
            </div>
            {cardContent}
        </div>
    );
};
