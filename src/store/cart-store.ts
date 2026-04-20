"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  size: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: number, size: string, quantity: number) => void;
  removeItem: (productId: number, size: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (existing) => existing.productId === item.productId && existing.size === item.size,
          );
          if (existingIndex === -1) {
            return { items: [...state.items, item] };
          }

          const updated = [...state.items];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + item.quantity,
          };

          return { items: updated };
        }),
      updateQuantity: (productId, size, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.size === size ? { ...item, quantity } : item,
          ),
        })),
      removeItem: (productId, size) =>
        set((state) => ({
          items: state.items.filter((item) => !(item.productId === productId && item.size === size)),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "tshirt-cart" },
  ),
);
