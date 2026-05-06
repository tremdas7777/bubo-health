import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Product } from "@/data/store";
import { applyCanonicalProductMedia } from "@/lib/productCanonicalMedia";

interface WishlistContextType {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (product: Product) => void;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem("bubohealth-wishlist");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.map((p: Product) => applyCanonicalProductMedia(p)) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("bubohealth-wishlist", JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product: Product) => {
    const normalized = applyCanonicalProductMedia(product);
    setItems((prev) => {
      if (prev.find((p) => p.id === normalized.id)) return prev;
      return [...prev, normalized];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => items.some((p) => p.id === productId),
    [items]
  );

  const toggleItem = useCallback(
    (product: Product) => {
      if (items.some((p) => p.id === product.id)) {
        removeItem(product.id);
      } else {
        addItem(product);
      }
    },
    [items, addItem, removeItem]
  );

  return (
    <WishlistContext.Provider
      value={{ items, addItem, removeItem, isInWishlist, toggleItem, totalItems: items.length }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
