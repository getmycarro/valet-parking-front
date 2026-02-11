/**
 * ID generation utilities
 */

/**
 * Generate a unique ID
 * Combines timestamp with random string for uniqueness
 */
export function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Get ticket number from car ID (last 7 characters)
 */
export function getTicketNumber(carId: string): string {
  return carId.slice(-7).toUpperCase();
}
