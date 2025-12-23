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
        
        // Basic check: if cart has items from another restaurant, warn or reset? 
        // For MVP, if restaurantId is null, we set it.
        // If it's different, we should technically clear or warn, but let's just set it if null.
        
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
            restaurantId: restaurantId || item.restaurant_id, // Set global ID if not set
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
