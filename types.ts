export const DEFAULT_CATEGORIES = [
  "Top",
  "Bottom",
  "Dress",
  "Outerwear",
  "Shoes",
  "Accessory",
  "Nightsuit",
  "Hair Accessory",
  "Whites",
  "Bedsheets",
];

export enum Occasion {
  CASUAL = "Casual",
  FORMAL = "Formal",
  PARTY = "Party",
  WORK = "Work",
  WORKOUT = "Workout",
  LOUNGE = "Lounge",
}

export enum LaundryStatus {
  AVAILABLE = "Available",
  IN_LAUNDRY = "In Laundry",
  WASHED = "Washed",
}

export enum IroningStatus {
  IRONED = "Ironed",
  NEEDS_IRONING = "Needs Ironing",
}

export interface ClothingItemLocation {
  storage: string;
  container: string;
  subContainer?: string;
}

export interface ClothingItem {
  id: string;
  name: string;
  category: string; // Changed from enum to string
  occasions: Occasion[];
  location?: ClothingItemLocation;
  imageUrl: string;
  laundryInstructions: string;
  status: LaundryStatus;
  addedToLaundryAt?: number;
  ironingStatus: IroningStatus;
  dominantColor?: string;
}

export interface LaundryNotification {
  id: string;
  message: string;
  itemId: string;
}

export interface WornLogEntry {
  itemId: string;
  date: number; // timestamp
}

export interface UnprocessedItem {
    originalName: string;
    imageUrl: string;
}

export interface PlannedOutfit {
    itemIds: string[];
    note?: string;
}

export interface PlannedOutfits {
    [date: string]: PlannedOutfit; // key is 'YYYY-MM-DD'
}

export interface AppSettings {
    aiFeaturesEnabled: boolean;
    theme: 'light' | 'dark';
}

export interface NotificationSettings {
    enabled: boolean;
    time: string; // "HH:MM"
}

export interface OutfitSuggestion {
    top?: string;
    bottom?: string;
    dress?: string;
    outerwear?: string;
    shoes?: string;
    accessory?: string;
    reasoning: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  location?: ClothingItemLocation;
  notes?: string;
}
