import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { WardrobeView } from './components/WardrobeView';
import { OutfitHelperView } from './components/OutfitHelperView';
import { LaundryView } from './components/LaundryView';
import { ItemDetailsModal } from './components/ItemDetailsModal';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { ClothingItem, LaundryNotification, WornLogEntry, UnprocessedItem, PlannedOutfits, AppSettings, NotificationSettings, InventoryItem } from './types';
import { LaundryStatus, IroningStatus, DEFAULT_CATEGORIES } from './types';
import { OnboardingView } from './components/OnboardingView';
import { BulkAddItemView } from './components/BulkAddItemView';
import { PlannerView } from './components/PlannerView';
import { InsightsView } from './components/InsightsView';
import { SettingsView } from './components/SettingsView';
import { PlannerModal } from './components/PlannerModal';
import { InventoryView } from './components/InventoryView';
import { InventoryItemModal } from './components/InventoryItemModal';


// Tell TypeScript that JSZip exists on the window object
declare global {
    interface Window {
        JSZip: any;
    }
}

// Utility to get a timezone-safe YYYY-MM-DD string from a Date object
const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export type View = 'items' | 'outfit' | 'laundry' | 'bulk-add' | 'planner' | 'insights' | 'settings' | 'inventory';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('items');
  
  // Clothing item state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null);
  const [wardrobe, setWardrobe] = useLocalStorage<ClothingItem[]>('wardrobe', []);
  
  // Inventory item state
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [editingInventoryItem, setEditingInventoryItem] = useState<InventoryItem | null>(null);
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('inventory', []);

  const [laundryNotifications, setLaundryNotifications] = useState<LaundryNotification[]>([]);
  const [isOnboarding, setIsOnboarding] = useLocalStorage('isOnboardingComplete', true);
  const [wearLog, setWearLog] = useLocalStorage<WornLogEntry[]>('wearLog', []);
  const [unprocessedItems, setUnprocessedItems] = useState<UnprocessedItem[]>([]);
  const [categories, setCategories] = useLocalStorage<string[]>('customCategories', DEFAULT_CATEGORIES);
  const [plannedOutfits, setPlannedOutfits] = useLocalStorage<PlannedOutfits>('plannedOutfits', {});
  const [appSettings, setAppSettings] = useLocalStorage<AppSettings>('appSettings', { aiFeaturesEnabled: true, theme: 'light' });
  const [notificationSettings, setNotificationSettings] = useLocalStorage<NotificationSettings>('notificationSettings', { enabled: false, time: '08:00' });
  
  const [isPlannerModalOpen, setIsPlannerModalOpen] = useState(false);
  const [planningDate, setPlanningDate] = useState<Date | null>(null);
  const [itemToPlan, setItemToPlan] = useState<ClothingItem | null>(null);

  const previousView = useRef<View>('items');

  // Effect to manage dark mode class on the HTML element
  useEffect(() => {
    const root = window.document.documentElement;
    if (appSettings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [appSettings.theme]);

  // Effect to process past planned outfits and move them to laundry
  useEffect(() => {
    const todayString = getLocalDateString(new Date());

    const newWearLogEntries: WornLogEntry[] = [];
    const itemIdsToMoveToLaundry = new Set<string>();
    const newPlannedOutfits = { ...plannedOutfits };
    let outfitsChanged = false;

    Object.keys(newPlannedOutfits).forEach(dateStr => {
        if (dateStr < todayString) {
            outfitsChanged = true;
            const plan = newPlannedOutfits[dateStr];
            if (plan && plan.itemIds) {
                // Parse date string safely as local date
                const wornDate = new Date(`${dateStr}T12:00:00`);
                plan.itemIds.forEach(itemId => {
                    itemIdsToMoveToLaundry.add(itemId);
                    newWearLogEntries.push({ itemId, date: wornDate.getTime() });
                });
            }
            // We keep past plans as history, but we need to move the items to laundry.
            // Let's not delete them from the planner. The wearLog is the source of truth for worn items.
        }
    });
    
    // We only process outfits that are from before today and move them to the wear log
    const processOutfits = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayLocalString = getLocalDateString(today);

        const newWearLog = [...wearLog];
        const updatedWardrobe = [...wardrobe];
        let changed = false;

        Object.keys(plannedOutfits).forEach(dateStr => {
            if (dateStr < todayLocalString) {
                // Check if already processed
                const alreadyLogged = wearLog.some(log => getLocalDateString(new Date(log.date)) === dateStr);
                if (!alreadyLogged) {
                    changed = true;
                    const plan = plannedOutfits[dateStr];
                    const wornDate = new Date(`${dateStr}T12:00:00`);
                    plan.itemIds.forEach(id => {
                        newWearLog.push({ itemId: id, date: wornDate.getTime() });
                        const itemIndex = updatedWardrobe.findIndex(item => item.id === id);
                        if (itemIndex !== -1) {
                            updatedWardrobe[itemIndex] = {
                                ...updatedWardrobe[itemIndex],
                                status: LaundryStatus.IN_LAUNDRY,
                                ironingStatus: IroningStatus.NEEDS_IRONING,
                                addedToLaundryAt: Date.now(),
                            };
                        }
                    });
                }
            }
        });

        if (changed) {
            setWearLog(newWearLog);
            setWardrobe(updatedWardrobe);
        }
    };

    processOutfits();
    // This effect should run once on mount to catch up.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect for daily notifications
  useEffect(() => {
    let timerId: number | undefined;

    if (notificationSettings.enabled && 'Notification' in window && Notification.permission === 'granted') {
      const checkTime = () => {
        const now = new Date();
        const [hour, minute] = notificationSettings.time.split(':').map(Number);
        
        if (now.getHours() === hour && now.getMinutes() === minute) {
          new Notification('Outfit Planner Reminder', {
            body: "Don't forget to plan your outfit for tomorrow!",
          });
        }
      };
      
      // Check every minute
      timerId = window.setInterval(checkTime, 60000);
    }

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [notificationSettings]);


  const checkLaundry = useCallback(() => {
    const newNotifications: LaundryNotification[] = [];
    const fiveDaysInMillis = 5 * 24 * 60 * 60 * 1000;

    wardrobe.forEach(item => {
      if (item.status === LaundryStatus.IN_LAUNDRY && item.addedToLaundryAt) {
        if (Date.now() - item.addedToLaundryAt > fiveDaysInMillis) {
          newNotifications.push({
            id: `laundry-${item.id}`,
            message: `Your "${item.name}" has been in the laundry for over 5 days!`,
            itemId: item.id
          });
        }
      }
    });
    setLaundryNotifications(newNotifications);
  }, [wardrobe]);
  
  useEffect(() => {
    checkLaundry();
    const interval = setInterval(checkLaundry, 60 * 60 * 1000); // Check every hour
    return () => clearInterval(interval);
  }, [wardrobe, checkLaundry]);

  const handleSaveItem = (itemData: Omit<ClothingItem, 'id'> | ClothingItem) => {
    if ('id' in itemData) {
      setWardrobe(wardrobe.map(item => item.id === itemData.id ? itemData : item));
    } else {
      const newItem: ClothingItem = { ...itemData, id: new Date().toISOString() };
      setWardrobe([...wardrobe, newItem]);
    }
    setIsDetailsModalOpen(false);
    setEditingItem(null);
  };

  const updateItem = (updatedItem: ClothingItem) => {
    setWardrobe(wardrobe.map(item => item.id === updatedItem.id ? updatedItem : item));
  };
  
  const handleEditItem = (item: ClothingItem) => {
    setEditingItem(item);
    setIsDetailsModalOpen(true);
  };

  const deleteItem = (itemId: string) => {
    setWardrobe(wardrobe.filter(item => item.id !== itemId));
  };

  const handleMoveToLaundry = (itemId: string) => {
    setWardrobe(w => w.map(item => 
        item.id === itemId 
        ? { ...item, status: LaundryStatus.IN_LAUNDRY, addedToLaundryAt: Date.now() } 
        : item
    ));
  };

  const handleMarkItemAsWashed = (itemId: string) => {
    setWardrobe(w => w.map(item => 
        item.id === itemId && item.status === LaundryStatus.IN_LAUNDRY
        ? { ...item, status: LaundryStatus.WASHED, addedToLaundryAt: undefined }
        : item
    ));
  };
  
  const handlePlanToWear = (item: ClothingItem) => {
      setItemToPlan(item);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      setPlanningDate(tomorrow);
      setIsPlannerModalOpen(true);
  };
  
  const handleOpenPlannerForDate = (date: Date) => {
      setItemToPlan(null);
      setPlanningDate(date);
      setIsPlannerModalOpen(true);
  };
  
  const handleSavePlannedOutfit = (date: Date, itemIds: string[], note: string) => {
      const dateString = getLocalDateString(date);
      setPlannedOutfits(prev => ({...prev, [dateString]: { itemIds, note } }));
      setIsPlannerModalOpen(false);
      setPlanningDate(null);
      setItemToPlan(null);
  };

  const handleMarkAsWashed = (categoriesToClear?: string[]) => {
      setWardrobe(prevWardrobe =>
          prevWardrobe.map(item => {
              if (item.status === LaundryStatus.IN_LAUNDRY) {
                  if (!categoriesToClear || categoriesToClear.includes(item.category)) {
                      return {
                          ...item,
                          status: LaundryStatus.WASHED,
                          addedToLaundryAt: undefined,
                      };
                  }
              }
              return item;
          })
      );
  };

  const handlePutAwayItem = (itemId: string) => {
    setWardrobe(prevWardrobe => 
        prevWardrobe.map(item => 
            item.id === itemId ? { ...item, status: LaundryStatus.AVAILABLE } : item
        )
    );
  };
  
  const handleZipFileSelected = async (file: File) => {
      const JSZip = window.JSZip;
      if (!JSZip) {
          alert("Could not process zip file. The JSZip library is not available.");
          return;
      }
      try {
        const zip = await JSZip.loadAsync(file);
        const imagePromises: Promise<UnprocessedItem>[] = [];
        zip.forEach((relativePath: string, zipEntry: any) => {
            if (!zipEntry.dir && (zipEntry.name.match(/\.(jpg|jpeg|png|gif)$/i))) {
                const promise = zipEntry.async('base64').then((base64: string) => ({
                    originalName: zipEntry.name,
                    imageUrl: `data:image/${zipEntry.name.split('.').pop()};base64,${base64}`
                }));
                imagePromises.push(promise);
            }
        });
        const items = await Promise.all(imagePromises);
        if (items.length === 0) {
            alert("The selected zip file does not contain any valid images (jpg, jpeg, png, gif).");
            return;
        }
        setUnprocessedItems(items);
        previousView.current = activeView;
        setActiveView('bulk-add');
      } catch (error) {
        console.error("Error processing zip file:", error);
        alert("There was an error processing the zip file. It might be corrupted or not a valid zip file. Please check the console for more details.");
      }
  };

  const handleBulkAddItems = (itemsToAdd: Omit<ClothingItem, 'id'>[]) => {
      const newItems: ClothingItem[] = itemsToAdd.map(item => ({
          ...item,
          id: `${new Date().toISOString()}-${Math.random()}`
      }));
      setWardrobe(prev => [...prev, ...newItems]);
      setUnprocessedItems([]);
      setActiveView(previousView.current);
  };

  const handleAddCategory = (category: string) => {
      if (category && !categories.find(c => c.toLowerCase() === category.toLowerCase())) {
          setCategories([...categories, category]);
      }
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
      setCategories(categories.filter(c => c !== categoryToDelete));
  };
  
  // Inventory Handlers
  const handleSaveInventoryItem = (itemData: Omit<InventoryItem, 'id'> | InventoryItem) => {
    if ('id' in itemData) {
      setInventory(inventory.map(item => item.id === itemData.id ? itemData : item));
    } else {
      const newItem: InventoryItem = { ...itemData, id: new Date().toISOString() };
      setInventory([...inventory, newItem]);
    }
    setIsInventoryModalOpen(false);
    setEditingInventoryItem(null);
  };

  const handleEditInventoryItem = (item: InventoryItem) => {
    setEditingInventoryItem(item);
    setIsInventoryModalOpen(true);
  };

  const handleDeleteInventoryItem = (itemId: string) => {
    setInventory(inventory.filter(item => item.id !== itemId));
  };

  const handleFabClick = () => {
    if (activeView === 'inventory') {
        setEditingInventoryItem(null);
        setIsInventoryModalOpen(true);
    } else {
        setEditingItem(null);
        setIsDetailsModalOpen(true);
    }
  };


  const renderView = () => {
    switch (activeView) {
      case 'items':
        return <WardrobeView wardrobe={wardrobe} updateItem={updateItem} deleteItem={deleteItem} onPlanToWear={handlePlanToWear} onEditItem={handleEditItem} onZipUpload={handleZipFileSelected} onMoveToLaundry={handleMoveToLaundry} />;
      case 'inventory':
        return <InventoryView inventory={inventory} onEditItem={handleEditInventoryItem} onDeleteItem={handleDeleteInventoryItem} />;
      case 'outfit':
        return <OutfitHelperView wardrobe={wardrobe} aiFeaturesEnabled={appSettings.aiFeaturesEnabled} />;
      case 'laundry':
        return <LaundryView wardrobe={wardrobe} updateItem={updateItem} notifications={laundryNotifications} onMarkAsWashed={handleMarkAsWashed} onMarkItemAsWashed={handleMarkItemAsWashed} onPutAway={handlePutAwayItem} onEditItem={handleEditItem} />;
      case 'bulk-add':
        return <BulkAddItemView items={unprocessedItems} onSave={handleBulkAddItems} onCancel={() => setActiveView(previousView.current)} categories={categories} aiFeaturesEnabled={appSettings.aiFeaturesEnabled} />;
      case 'planner':
        return <PlannerView plannedOutfits={plannedOutfits} wearLog={wearLog} wardrobe={wardrobe} onSelectDate={handleOpenPlannerForDate} />;
      case 'insights':
        return <InsightsView wearLog={wearLog} wardrobe={wardrobe} />;
      case 'settings':
        return <SettingsView 
                    categories={categories} 
                    onAddCategory={handleAddCategory} 
                    onDeleteCategory={handleDeleteCategory}
                    appSettings={appSettings}
                    onAppSettingsChange={setAppSettings}
                    notificationSettings={notificationSettings}
                    onNotificationSettingsChange={setNotificationSettings}
                />;
      default:
        return <WardrobeView wardrobe={wardrobe} updateItem={updateItem} deleteItem={deleteItem} onPlanToWear={handlePlanToWear} onEditItem={handleEditItem} onZipUpload={handleZipFileSelected} onMoveToLaundry={handleMoveToLaundry} />;
    }
  };
  
  if (isOnboarding) {
      return <OnboardingView onStart={() => setIsOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Header activeView={activeView} setActiveView={setActiveView} aiFeaturesEnabled={appSettings.aiFeaturesEnabled} />
      <main className="p-4 sm:p-6 lg:p-8">
        {renderView()}
      </main>
      <button
        onClick={handleFabClick}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        aria-label={activeView === 'inventory' ? "Add new inventory item" : "Add new clothing item"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
      {isDetailsModalOpen && (
        <ItemDetailsModal
          itemToEdit={editingItem}
          onClose={() => { setIsDetailsModalOpen(false); setEditingItem(null); }}
          onSave={handleSaveItem}
          categories={categories}
          aiFeaturesEnabled={appSettings.aiFeaturesEnabled}
        />
      )}
      {isInventoryModalOpen && (
        <InventoryItemModal 
          itemToEdit={editingInventoryItem}
          onClose={() => { setIsInventoryModalOpen(false); setEditingInventoryItem(null); }}
          onSave={handleSaveInventoryItem}
        />
      )}
      {isPlannerModalOpen && planningDate && (
          <PlannerModal 
            date={planningDate}
            wardrobe={wardrobe}
            wearLog={wearLog}
            initialSelectedItem={itemToPlan}
            plannedOutfits={plannedOutfits}
            onClose={() => setIsPlannerModalOpen(false)}
            onSave={handleSavePlannedOutfit}
            appSettings={appSettings}
          />
      )}
    </div>
  );
};

export default App;
