import React, { useState } from 'react';
import type { ClothingItem } from '../types';
import { ClothingItemCard } from './ClothingItemCard';

interface ClothingItemStackProps {
    items: ClothingItem[];
    onUpdate: (item: ClothingItem) => void;
    onDelete: (id: string) => void;
    onPlanToWear: (item: ClothingItem) => void;
    onEdit: (item: ClothingItem) => void;
    onMoveToLaundry: (id: string) => void;
}

// Helper to convert hex to HSL (for sorting by hue)
const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h, s, l };
};

const CHUNK_SIZE = 5;

const Stack: React.FC<ClothingItemStackProps & { items: ClothingItem[] }> = ({ items, ...cardProps }) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const verticalOffset = 30; // Overlap in pixels
    const cardHeight = 192; // h-48
    const expandedCardHeight = 440; // Estimated expanded height

    const totalHeight = activeIndex === null
        ? (items.length - 1) * verticalOffset + cardHeight
        : (items.length - 1) * verticalOffset + expandedCardHeight;

    return (
        <div 
            className="relative transition-all duration-300"
            style={{ 
                width: '16rem', /* w-64 */
                height: `${totalHeight}px` 
            }}
        >
            {items.map((item, index) => (
                <div
                    key={item.id}
                    className="absolute w-full transition-transform duration-300 ease-in-out"
                    style={{
                        transform: activeIndex !== null && index > activeIndex ? `translateY(${(expandedCardHeight - cardHeight)}px)` : 'translateY(0)',
                        top: `${index * verticalOffset}px`,
                        zIndex: activeIndex === index ? 10 : index,
                    }}
                >
                     <ClothingItemCard 
                        item={item} 
                        {...cardProps} 
                        isStacked={true} 
                        isActive={activeIndex === index}
                        onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                     />
                </div>
            ))}
        </div>
    );
}


export const ClothingItemStack: React.FC<ClothingItemStackProps> = ({ items, ...cardProps }) => {
    
    const sortedItems = [...items].sort((a, b) => {
        const colorA = a.dominantColor || '#808080';
        const colorB = b.dominantColor || '#808080';
        const hslA = hexToHsl(colorA);
        const hslB = hexToHsl(colorB);
        // Sort by hue, then lightness
        if (hslA.h < hslB.h) return -1;
        if (hslA.h > hslB.h) return 1;
        if (hslA.l < hslB.l) return -1;
        if (hslA.l > hslB.l) return 1;
        return 0;
    });

    const chunkedItems = [];
    for (let i = 0; i < sortedItems.length; i += CHUNK_SIZE) {
        chunkedItems.push(sortedItems.slice(i, i + CHUNK_SIZE));
    }

    return (
        <div className="flex flex-wrap gap-x-8 gap-y-4 items-start">
            {chunkedItems.map((chunk, chunkIndex) => (
                <Stack key={chunkIndex} items={chunk} {...cardProps} />
            ))}
        </div>
    );
};
