/**
 * Payment utilities
 * Consolidates payment-related logic used throughout the application
 */

import type { PaymentRecord, PaymentMethod } from "@/lib/types";

/**
 * Get the latest payment for a car
 */
export function getLatestPayment(
  carId: string,
  payments: PaymentRecord[]
): PaymentRecord | undefined {
  const carPayments = payments.filter((p) => p.parkingRecordId === carId);
  if (carPayments.length === 0) return undefined;

  return carPayments.reduce((latest, current) => {
    return current.date > latest.date ? current : latest;
  });
}

/**
 * Get payment method by ID
 */
export function getPaymentMethod(
  methodId: string,
  paymentMethods: PaymentMethod[]
): PaymentMethod | undefined {
  return paymentMethods.find((m) => m.id === methodId);
}

/**
 * Get payment method name by ID
 */
export function getPaymentMethodName(
  methodId: string,
  paymentMethods: PaymentMethod[]
): string {
  const method = getPaymentMethod(methodId, paymentMethods);
  return method ? method.name : "Unknown";
}

/**
 * Calculate amount with tip
 */
export function calculateAmountWithTip(
  baseAmount: number,
  tipAmount: number
): number {
  return baseAmount + tipAmount;
}

/**
 * Format currency amount in USD
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
