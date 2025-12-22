import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MenuItem } from '../types/database';

export interface CartItem extends MenuItem {
  quantity: number;
  restaurantId: string;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null; // Cart can only hold items from one restaurant at a time
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,

      addItem: (item) => {
        const { items, restaurantId } = get();
        
        // If adding item from different restaurant, confirm clear (UI should handle confirmation, here we just reset logic or enforce)
        // For simplicity, if restaurantId mismatches, we replace the cart or error. 
        // Let's implement: if mismatch, we overwrite.
        if (restaurantId && restaurantId !== item.restaurant_id) {
           // This logic should ideally be handled in UI (Alert: "Start new basket?").
           // For the store, we'll assume the UI allowed it and cleared first.
           // But to be safe:
           set({ items: [{ ...item, quantity: 1, restaurantId: item.restaurant_id }], restaurantId: item.restaurant_id });
           return;
        }

        const existingItem = items.find((i) => i.id === item.id);
        if (existingItem) {
          set({
            items: items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({
            items: [...items, { ...item, quantity: 1, restaurantId: item.restaurant_id }],
            restaurantId: item.restaurant_id,
          });
        }
      },

      removeItem: (itemId) => {
        const { items } = get();
        const newItems = items.filter((i) => i.id !== itemId);
        set({ 
            items: newItems,
            restaurantId: newItems.length === 0 ? null : get().restaurantId 
        });
      },

      updateQuantity: (itemId, delta) => {
          const { items } = get();
          const newItems = items
             .map(i => {
                 if (i.id === itemId) return { ...i, quantity: Math.max(0, i.quantity + delta) };
                 return i;
             })
             .filter(i => i.quantity > 0);
          
          set({
              items: newItems,
              restaurantId: newItems.length === 0 ? null : get().restaurantId
          });
      },

      clearCart: () => set({ items: [], restaurantId: null }),

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'nebula-cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
