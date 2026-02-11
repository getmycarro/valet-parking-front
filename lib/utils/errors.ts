/**
 * Custom error classes and error handling utilities
 */

/**
 * Authentication error
 */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Store/State management error
 */
export class StoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoreError";
  }
}

/**
 * Validation error
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Log error to console with context
 */
export function logError(error: Error, context?: string): void {
  const timestamp = new Date().toISOString();
  const contextStr = context ? `[${context}]` : "";
  console.error(`${timestamp} ${contextStr} ${error.name}: ${error.message}`);
  if (error.stack) {
    console.error(error.stack);
  }
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    logError(error as Error, "JSON Parse");
    return fallback;
  }
}

/**
 * Safe localStorage get with error handling
 */
export function safeLocalStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    logError(error as Error, `localStorage.getItem(${key})`);
    return null;
  }
}

/**
 * Safe localStorage set with error handling
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    logError(error as Error, `localStorage.setItem(${key})`);
    return false;
  }
}
