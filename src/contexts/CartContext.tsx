import React, { createContext, useContext, useState, useCallback } from "react";
import { Product } from "@/data/store";
import { trackEvent } from "@/lib/funnelTracking";

export interface CartItemSelection {
  color?: string;
  size?: string;
  flavor?: string;
  name?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selections?: CartItemSelection[];
  /** Stable key used to differentiate same product with different selections */
  lineId: string;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (product: Product, quantity?: number, selections?: CartItemSelection[]) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function buildLineId(productId: string, selections?: CartItemSelection[]) {
  if (!selections || selections.length === 0) return productId;
  return `${productId}::${selections.map((s) => `${s.color || ""}|${s.size || ""}|${s.flavor || ""}`).join("__")}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((product: Product, quantity = 1, selections?: CartItemSelection[]) => {
    const lineId = buildLineId(product.id, selections);
    setItems((prev) => {
      const existing = prev.find((item) => item.lineId === lineId);
      if (existing) {
        return prev.map((item) =>
          item.lineId === lineId ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }
      return [...prev, { product, quantity, selections, lineId }];
    });
    setIsOpen(true);
    void trackEvent("add_to_cart");
  }, []);

  const removeItem = useCallback((lineId: string) => {
    setItems((prev) => prev.filter((item) => item.lineId !== lineId));
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.lineId !== lineId));
      return;
    }
    setItems((prev) => prev.map((item) => (item.lineId === lineId ? { ...item, quantity } : item)));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  // totalPrice in USD cents (product.price is in decimal USD)
  const totalPrice = items.reduce(
    (sum, item) => sum + Math.round(item.product.price * 100) * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{ items, isOpen, setIsOpen, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
