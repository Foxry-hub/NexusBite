import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
}

interface CartState {
  items: CartItem[];
  pickupTime: "BREAK_1" | "BREAK_2" | null;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (menuId: string) => void;
  updateQuantity: (menuId: string, quantity: number) => void;
  setPickupTime: (time: "BREAK_1" | "BREAK_2") => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      pickupTime: null,

      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.menuId === item.menuId);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.menuId === item.menuId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),

      removeItem: (menuId) =>
        set((state) => ({
          items: state.items.filter((i) => i.menuId !== menuId),
        })),

      updateQuantity: (menuId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.menuId !== menuId)
              : state.items.map((i) =>
                  i.menuId === menuId ? { ...i, quantity } : i
                ),
        })),

      setPickupTime: (time) => set({ pickupTime: time }),

      clearCart: () => set({ items: [], pickupTime: null }),

      getTotalAmount: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "nexusbite-cart",
    }
  )
);
