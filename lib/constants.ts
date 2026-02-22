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
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MANAGER: "manager",
  ATTENDANT: "attendant",
} as const;

export type UserRoleValue = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/**
 * Route access per role
 */
export const ROLE_ROUTE_ACCESS: Record<string, UserRoleValue[]> = {
  "/admin/dashboard": ["super_admin", "admin", "manager"],
  "/admin/employees": ["super_admin", "admin"],
  "/admin/billing": ["super_admin", "admin", "manager"],
  "/admin/companies": ["super_admin"],
  "/admin/users": ["super_admin"],
  "/attendant/dashboard": ["attendant"],
};

/**
 * Default redirect after login per role
 */
export const ROLE_DEFAULT_REDIRECT: Record<UserRoleValue, string> = {
  super_admin: "/admin/dashboard",
  admin: "/admin/dashboard",
  manager: "/admin/dashboard",
  attendant: "/attendant/dashboard",
};

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
 * Default notification count for active vehicles
 */
export const DEFAULT_NOTIFICATION_COUNT = 5;
