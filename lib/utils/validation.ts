/**
 * Validation utilities
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email) return true; // Email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return true; // Phone is optional
  // Remove common separators
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, "");
  // Check if it contains only digits and has reasonable length
  return /^\d{7,15}$/.test(cleaned);
}

/**
 * Sanitize user input by trimming whitespace
 */
export function sanitizeInput(input: string): string {
  return input.trim();
}

/**
 * Validate required field
 */
export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Validate plate format (alphanumeric, 3-10 characters)
 */
export function isValidPlate(plate: string): boolean {
  const cleaned = plate.replace(/[\s\-]/g, "");
  return /^[A-Z0-9]{3,10}$/i.test(cleaned);
}
