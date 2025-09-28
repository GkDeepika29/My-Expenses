import type { ClothingItem, OutfitSuggestion } from '../types';
import { LaundryStatus } from '../types';

export const getMockOutfitSuggestion = async (occasion: string, wardrobe: ClothingItem[]): Promise<OutfitSuggestion | null> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    const availableItems = wardrobe.filter(item => item.status === LaundryStatus.AVAILABLE);
    if (availableItems.length === 0) {
        return { reasoning: "No clothes are available in your wardrobe." };
    }

    const suggestion: OutfitSuggestion = { reasoning: `This is a sample outfit for a "${occasion}" occasion. As AI features are not configured with an API key, we've picked a few items for you from your wardrobe.` };
    
    const findItem = (category: string) => {
        const catLower = category.toLowerCase();
        return availableItems.find(item => item.category.toLowerCase() === catLower);
    }

    const top = findItem("top");
    const bottom = findItem("bottom");
    const shoes = findItem("shoes");
    const outerwear = findItem("outerwear");
    const accessory = findItem("accessory");

    if (!top && !bottom) {
        const dress = findItem("dress");
        if (dress) {
            suggestion.dress = dress.id;
        } else {
            if (top) suggestion.top = top.id;
            if (bottom) suggestion.bottom = bottom.id;
        }
    } else {
        if (top) suggestion.top = top.id;
        if (bottom) suggestion.bottom = bottom.id;
    }
    
    if (shoes) suggestion.shoes = shoes.id;
    if (outerwear) suggestion.outerwear = outerwear.id;
    if (accessory) suggestion.accessory = accessory.id;
    
    if (Object.keys(suggestion).length === 1 && availableItems.length > 0) { // only reasoning
        const firstItem = availableItems[0];
        const categoryKey = firstItem.category.toLowerCase() as keyof OutfitSuggestion;
        if (['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory'].includes(categoryKey)) {
             suggestion[categoryKey] = firstItem.id;
        } else {
            suggestion.top = firstItem.id;
        }
        suggestion.reasoning = "This is a sample suggestion. As AI features are not configured with an API key, we picked one of your available items."
    }

    return suggestion;
};

export const mockCategorizeImage = async (base64Image: string, customCategories: string[]): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return customCategories.length > 0 ? customCategories[Math.floor(Math.random() * customCategories.length)] : "Top";
};

export const mockGetDominantColor = async (base64Image: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const colors = ['#e0e7ff', '#fecaca', '#d1fae5', '#fef3c7', '#e5e7eb', '#c7d2fe', '#fbcfe8', '#bfdbfe'];
    return colors[Math.floor(Math.random() * colors.length)];
};
