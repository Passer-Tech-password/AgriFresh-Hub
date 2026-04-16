"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  vendorId: string;
  name: string;
  unit: string;
  priceKobo: number;
  quantity: number;
  moq: number;
  bulkPricing?: { minQty: number; pricePerUnitKobo: number }[];
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const qty = item.quantity ?? 1;
        const safeQty = Number.isFinite(qty) ? Math.max(1, Math.floor(qty)) : 1;
        const existing = get().items.find((i) => i.productId === item.productId);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.productId === item.productId ? { ...i, quantity: i.quantity + safeQty } : i
            )
          });
          return;
        }
        set({ items: [...get().items, { ...item, quantity: safeQty }] });
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },
      setQuantity: (productId, quantity) => {
        const safeQty = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity: safeQty } : i
          )
        });
      },
      clear: () => set({ items: [] })
    }),
    { name: "agrifresh-cart-v1" }
  )
);

export const getEffectivePrice = (item: CartItem) => {
  if (!item.bulkPricing || item.bulkPricing.length === 0) return item.priceKobo;

  // Sort by minQty descending to find the highest applicable tier
  const tiers = [...item.bulkPricing].sort((a, b) => b.minQty - a.minQty);
  const tier = tiers.find((t) => item.quantity >= t.minQty);

  return tier ? tier.pricePerUnitKobo : item.priceKobo;
};

export const selectCartTotalKobo = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + getEffectivePrice(item) * item.quantity, 0);

