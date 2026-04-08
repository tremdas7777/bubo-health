// Centralized pricing constants for consistency across the store
export const PIX_DISCOUNT_PERCENT = 5; // 5% discount for PIX payments
export const PIX_DISCOUNT_RATE = PIX_DISCOUNT_PERCENT / 100; // 0.05
export const INSTALLMENT_COUNT = 12;

export function getPixPrice(price: number): number {
  return price * (1 - PIX_DISCOUNT_RATE);
}

export function getPixSavings(price: number): number {
  return price * PIX_DISCOUNT_RATE;
}
