import React from 'react';
import { WardrobeIcon } from './icons/WardrobeIcon';

interface OnboardingViewProps {
    onStart: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onStart }) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center text-center p-6">
            <WardrobeIcon className="h-24 w-24 text-indigo-500 mb-6" />
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Welcome to Your Virtual Closet</h1>
            <p className="mt-4 max-w-lg text-lg text-gray-600 dark:text-gray-400">
                Never lose track of your clothes again. Organize everything, get smart outfit suggestions, and manage your laundry with ease.
            </p>
            <button
                onClick={onStart}
                className="mt-8 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
                Let's Get Started
            </button>
        </div>
    );
};