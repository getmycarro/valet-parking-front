/**
 * Application constants
 * Centralized location for all hardcoded values
 */

/**
 * localStorage keys
 */
export const STORAGE_KEYS = {
  AUTH: "valet_parking_auth_v2",
  STATE: "valet_parking_state_v2",
  // Old keys for migration
  AUTH_OLD: "valet_parking_auth",
  STATE_OLD: "valet_parking_state",
} as const;

/**
 * User roles
 */
export const USER_ROLES = {
  ADMIN: "admin",
  ATTENDANT: "attendant",
} as const;

/**
 * Payment types
 */
export const PAYMENT_TYPES = {
  ZELLE: "zelle",
  MOBILE_PAYMENT: "mobile_payment",
  BINANCE: "binance",
  CASH: "cash",
  CARD: "card",
} as const;

/**
 * Billing types
 */
export const BILLING_TYPES = {
  HOURLY: "hourly",
  FLAT_RATE: "flat_rate",
} as const;

/**
 * Validation types
 */
export const VALIDATION_TYPES = {
  AUTOMATIC: "automatic",
  MANUAL: "manual",
} as const;

/**
 * Payment statuses
 */
export const PAYMENT_STATUSES = {
  PENDING: "pending",
  RECEIVED: "received",
  CANCELLED: "cancelled",
} as const;

/**
 * Default settings
 */
export const DEFAULT_SETTINGS = {
  billing: {
    type: BILLING_TYPES.HOURLY as "hourly",
    rate: 3,
  },
  tipEnabled: true,
} as const;

// QR deshabilitado
// /**
//  * QR code version
//  */
// export const QR_CODE_VERSION = 1;

// /**
//  * QR code type identifier
//  */
// export const QR_CODE_TYPE = "valet_ticket";

/**
 * Default notification count for active vehicles
 */
export const DEFAULT_NOTIFICATION_COUNT = 5;
