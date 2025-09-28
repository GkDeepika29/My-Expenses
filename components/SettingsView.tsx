import React, { useState, useEffect } from 'react';
import { CogIcon } from './icons/CogIcon';
import type { AppSettings, NotificationSettings } from '../types';

interface SettingsViewProps {
    categories: string[];
    onAddCategory: (category: string) => void;
    onDeleteCategory: (category: string) => void;
    appSettings: AppSettings;
    onAppSettingsChange: (settings: AppSettings) => void;
    notificationSettings: NotificationSettings;
    onNotificationSettingsChange: (settings: NotificationSettings) => void;
}

const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void }> = ({ enabled, onChange }) => (
    <button
        type="button"
        className={`${enabled ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
        onClick={() => onChange(!enabled)}
    >
        <span className={`${enabled ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
    </button>
);

export const SettingsView: React.FC<SettingsViewProps> = ({ 
    categories, onAddCategory, onDeleteCategory,
    appSettings, onAppSettingsChange,
    notificationSettings, onNotificationSettingsChange
}) => {
    const [newCategory, setNewCategory] = useState('');
    const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
    const hasApiKey = !!process.env.API_KEY;

    const handleAddCategory = () => {
        if (newCategory.trim()) {
            onAddCategory(newCategory.trim());
            setNewCategory('');
        }
    };

    const handleRequestNotificationPermission = () => {
        Notification.requestPermission().then(permission => {
            setNotificationPermission(permission);
        });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
                <CogIcon className="mx-auto h-16 w-16 text-indigo-500" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Settings</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Customize your virtual closet experience.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg dark:border dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b dark:border-gray-600 pb-3">General</h2>
                 <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-medium text-gray-700 dark:text-gray-300">Theme</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Choose a light or dark theme for the app.</p>
                    </div>
                    <div className="flex items-center rounded-lg bg-gray-200 dark:bg-gray-700 p-1">
                        <button onClick={() => onAppSettingsChange({ ...appSettings, theme: 'light' })} className={`px-3 py-1 text-sm rounded-md transition-colors ${appSettings.theme === 'light' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600/50'}`}>Light</button>
                        <button onClick={() => onAppSettingsChange({ ...appSettings, theme: 'dark' })} className={`px-3 py-1 text-sm rounded-md transition-colors ${appSettings.theme === 'dark' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600/50'}`}>Dark</button>
                    </div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t dark:border-gray-600">
                    <div>
                        <h3 className="font-medium text-gray-700 dark:text-gray-300">Enable AI Features</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Auto-categorization, color detection, and outfit suggestions.</p>
                         {!hasApiKey && (
                            <div className="mt-2 text-sm text-orange-800 dark:text-orange-300 p-2 bg-orange-50 dark:bg-orange-500/10 rounded-md border border-orange-200 dark:border-orange-500/30">
                                <b>Demo Mode:</b> No API key found. AI features are running with sample data.
                            </div>
                        )}
                    </div>
                    <ToggleSwitch enabled={appSettings.aiFeaturesEnabled} onChange={enabled => onAppSettingsChange({ ...appSettings, aiFeaturesEnabled: enabled })} />
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg dark:border dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b dark:border-gray-600 pb-3">Notifications</h2>
                {notificationPermission === 'default' && (
                    <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg mb-4">
                        <p className="text-blue-700 dark:text-blue-300">Enable browser notifications to get reminders.</p>
                        <button onClick={handleRequestNotificationPermission} className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-semibold hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                            Allow
                        </button>
                    </div>
                )}
                {notificationPermission === 'denied' && (
                     <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-lg mb-4">
                        <p className="text-red-700 dark:text-red-300">Notifications are blocked. You'll need to enable them in your browser settings.</p>
                    </div>
                )}
                 {notificationPermission === 'granted' && (
                    <>
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-medium text-gray-700 dark:text-gray-300">Daily Outfit Reminder</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Get a reminder to plan your next day's outfit.</p>
                            </div>
                            <ToggleSwitch enabled={notificationSettings.enabled} onChange={enabled => onNotificationSettingsChange({ ...notificationSettings, enabled })} />
                        </div>
                        {notificationSettings.enabled && (
                             <div className="mt-4 pl-4 border-l-2 dark:border-gray-600">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reminder time</label>
                                <input 
                                    type="time" 
                                    value={notificationSettings.time}
                                    onChange={e => onNotificationSettingsChange({...notificationSettings, time: e.target.value })}
                                    className="mt-1 w-full sm:w-40 rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg dark:border dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b dark:border-gray-600 pb-3">Manage Categories</h2>
                <div className="flex gap-2 mb-6">
                    <input 
                        type="text" 
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                        placeholder="e.g., Leggings"
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                    />
                    <button 
                        onClick={handleAddCategory}
                        className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    >
                        Add
                    </button>
                </div>

                <div className="space-y-2">
                    {categories.map(category => (
                        <div key={category} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                            <span className="text-gray-700 dark:text-gray-200">{category}</span>
                            <button
                                onClick={() => onDeleteCategory(category)}
                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full dark:hover:bg-red-500/20"
                                aria-label={`Delete ${category}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
