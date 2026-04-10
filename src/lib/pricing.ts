// Centralized pricing constants for consistency across the store
export const PIX_DISCOUNT_PERCENT = 5; // 5% discount for PIX payments
export const PIX_DISCOUNT_RATE = PIX_DISCOUNT_PERCENT / 100; // 0.05
export const MAX_INSTALLMENTS = 6;
export const INSTALLMENT_INTEREST_RATE = 0.0249; // 2.49% ao mês para parcelas > 1x

export function getPixPrice(price: number): number {
  return price * (1 - PIX_DISCOUNT_RATE);
}

export function getPixSavings(price: number): number {
  return price * PIX_DISCOUNT_RATE;
}

/**
 * Calcula o valor total com juros compostos para parcelamento.
 * 1x = sem juros, 2x+ = juros de INSTALLMENT_INTEREST_RATE ao mês.
 */
export function getTotalWithInterest(price: number, installments: number): number {
  if (installments <= 1) return price;
  // Juros compostos: total = price * (1 + rate)^n
  return price * Math.pow(1 + INSTALLMENT_INTEREST_RATE, installments);
}

export function getInstallmentValue(price: number, installments: number): number {
  return getTotalWithInterest(price, installments) / installments;
}
