import React from 'react';
import type { View } from '../App';
import { WardrobeIcon } from './icons/WardrobeIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { WashingMachineIcon } from './icons/WashingMachineIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { CogIcon } from './icons/CogIcon';
import { BoxIcon } from './icons/BoxIcon';

interface HeaderProps {
    activeView: View;
    setActiveView: (view: View) => void;
    aiFeaturesEnabled: boolean;
}

const NavButton: React.FC<{
    label: string;
    view: View;
    activeView: View;
    onClick: (view: View) => void;
    children: React.ReactNode;
}> = ({ label, view, activeView, onClick, children }) => {
    const isActive = activeView === view;
    return (
        <button
            onClick={() => onClick(view)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
            }`}
        >
            {children}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
};


export const Header: React.FC<HeaderProps> = ({ activeView, setActiveView, aiFeaturesEnabled }) => {
    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm dark:border-b dark:border-gray-700 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-2">
                         <WardrobeIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-500" />
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden md:block">Virtual Closet</h1>
                    </div>
                    <nav className="flex space-x-1 sm:space-x-2">
                        <NavButton label="My Items" view="items" activeView={activeView} onClick={setActiveView}>
                            <WardrobeIcon className="h-5 w-5" />
                        </NavButton>
                        <NavButton label="Inventory" view="inventory" activeView={activeView} onClick={setActiveView}>
                            <BoxIcon className="h-5 w-5" />
                        </NavButton>
                        <NavButton label="Planner" view="planner" activeView={activeView} onClick={setActiveView}>
                            <CalendarIcon className="h-5 w-5" />
                        </NavButton>
                        {aiFeaturesEnabled && (
                            <NavButton label="Outfit Helper" view="outfit" activeView={activeView} onClick={setActiveView}>
                                <SparklesIcon className="h-5 w-5" />
                            </NavButton>
                        )}
                        <NavButton label="Laundry" view="laundry" activeView={activeView} onClick={setActiveView}>
                           <WashingMachineIcon className="h-5 w-5" />
                        </NavButton>
                        <NavButton label="Insights" view="insights" activeView={activeView} onClick={setActiveView}>
                           <ChartBarIcon className="h-5 w-5" />
                        </NavButton>
                        <NavButton label="Settings" view="settings" activeView={activeView} onClick={setActiveView}>
                           <CogIcon className="h-5 w-5" />
                        </NavButton>
                    </nav>
                </div>
            </div>
        </header>
    );
};
