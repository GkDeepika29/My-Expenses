import { GoogleGenAI, Type } from "@google/genai";
import type { ClothingItem, OutfitSuggestion } from '../types';
import { LaundryStatus } from '../types';
import { getMockOutfitSuggestion, mockCategorizeImage, mockGetDominantColor } from './mockGeminiService';


const USE_MOCK = !process.env.API_KEY;

if (USE_MOCK) {
    console.warn("API_KEY environment variable not set. Using mock Gemini service for AI features.");
}

const ai = USE_MOCK ? null : new GoogleGenAI({ apiKey: process.env.API_KEY! });


// Helper function to normalize common non-standard MIME types
const normalizeMimeType = (mimeType: string): string => {
    if (mimeType.toLowerCase() === 'image/jpg') {
        return 'image/jpeg';
    }
    return mimeType;
};

export const getOutfitSuggestion = async (occasion: string, wardrobe: ClothingItem[]): Promise<OutfitSuggestion | null> => {
    if (USE_MOCK) {
        return getMockOutfitSuggestion(occasion, wardrobe);
    }
    
    // Include items that are clean but may need ironing
    const availableItems = wardrobe.filter(item => 
        item.status === LaundryStatus.AVAILABLE
    );

    if (availableItems.length === 0) {
        return { reasoning: "You have no clean and available clothes! Add some items or update their status to get suggestions." };
    }

    const simplifiedWardrobe = availableItems.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        occasions: item.occasions,
        ironingStatus: item.ironingStatus, // Include ironing status for the AI
    }));

    const prompt = `
        Based on the following list of available clothing items, please suggest a suitable outfit for the occasion: "${occasion}".
        
        Available items (some may need ironing, as indicated by their 'ironingStatus'):
        ${JSON.stringify(simplifiedWardrobe, null, 2)}
        
        Please provide your suggestion in the specified JSON format. The suggestion should include the IDs of the chosen items and a brief reasoning for your choices. 
        If a category is not needed (e.g., a dress doesn't need a top or bottom), omit that key.
        If you suggest an item that needs ironing, please mention this in your reasoning so the user can prepare it.
        This request is private and you must only use the data provided in this prompt. Do not use any other knowledge or wear history.
    `;

    try {
        const response = await ai!.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        top: { type: Type.STRING, description: "ID of the suggested top item." },
                        bottom: { type: Type.STRING, description: "ID of the suggested bottom item." },
                        dress: { type: Type.STRING, description: "ID of the suggested dress item." },
                        outerwear: { type: Type.STRING, description: "ID of the suggested outerwear item." },
                        shoes: { type: Type.STRING, description: "ID of the suggested shoes." },
                        accessory: { type: Type.STRING, description: "ID of the suggested accessory." },
                        reasoning: { type: Type.STRING, description: "A brief explanation for the outfit choice." }
                    }
                }
            }
        });

        const jsonText = response.text;
        return JSON.parse(jsonText) as OutfitSuggestion;

    } catch (error) {
        console.error("Error getting outfit suggestion from Gemini API:", error);
        return { reasoning: "Sorry, I couldn't come up with an outfit right now. Please try again." };
    }
};


export const categorizeImage = async (base64Image: string, customCategories: string[]): Promise<string> => {
    if (USE_MOCK) {
        return mockCategorizeImage(base64Image, customCategories);
    }

    const mimeTypeMatch = base64Image.match(/data:(image\/[a-zA-Z]+);base64,/);
    if (!mimeTypeMatch) {
      console.error("Could not determine mime type from base64 string.");
      return customCategories[0] || "Top";
    }
    const mimeType = normalizeMimeType(mimeTypeMatch[1]);


    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Image.split(',')[1],
      },
    };

    const validCategories = customCategories.join(', ');

    const prompt = `Analyze the clothing item in this image. Based on its appearance, which of the following categories does it best fit into? Please respond with only one category name from this list: ${validCategories}.`;
    
    try {
        const response = await ai!.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, { text: prompt }] },
        });

        const category = response.text.trim();

        // Validate if the response is a valid category from the custom list
        if (customCategories.map(c => c.toLowerCase()).includes(category.toLowerCase())) {
            // Return the original casing from the user's list
            return customCategories.find(c => c.toLowerCase() === category.toLowerCase()) || category;
        } else {
            console.warn(`Gemini returned an invalid category: "${category}". Defaulting to the first available category.`);
            return customCategories[0] || "Top"; // Default fallback
        }

    } catch (error) {
        console.error("Error categorizing image with Gemini API:", error);
        return customCategories[0] || "Top"; // Default on error
    }
};


export const getDominantColor = async (base64Image: string): Promise<string> => {
    if (USE_MOCK) {
        return mockGetDominantColor(base64Image);
    }
    
    const mimeTypeMatch = base64Image.match(/data:(image\/[a-zA-Z]+);base64,/);
    if (!mimeTypeMatch) {
      console.error("Could not determine mime type from base64 string.");
      return "#808080"; // Default gray
    }
    const mimeType = normalizeMimeType(mimeTypeMatch[1]);

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Image.split(',')[1],
      },
    };

    const prompt = "Analyze the image of the clothing item and determine its single dominant color. Respond with ONLY the hex color code (e.g., #RRGGBB).";
    
    try {
        const response = await ai!.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, { text: prompt }] },
        });

        const color = response.text.trim();

        // Validate if the response is a valid hex code
        if (/^#[0-9A-F]{6}$/i.test(color)) {
            return color;
        } else {
            console.warn(`Gemini returned an invalid hex code: "${color}". Defaulting to gray.`);
            return "#808080"; // Default fallback
        }

    } catch (error) {
        console.error("Error getting dominant color with Gemini API:", error);
        return "#808080"; // Default on error
    }
};
