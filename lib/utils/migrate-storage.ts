/**
 * localStorage Migration Utility
 * Migrates data from Spanish property names to English
 */

import { STORAGE_KEYS, DEFAULT_SETTINGS } from "@/lib/constants";
import { safeJsonParse, safeLocalStorageGet, safeLocalStorageSet, logError } from "./errors";

interface OldAuthState {
  usuario?: {
    nombre?: string;
    rol?: string;
  };
}

interface NewAuthState {
  user?: {
    name?: string;
    role?: string;
  };
}

interface OldStoreState {
  empleados?: any[];
  autos?: any[];
  metodosPago?: any[];
  configuracion?: {
    cobro?: {
      tipo?: string;
      tarifa?: number;
    };
    propinaHabilitada?: boolean;
  };
  pagos?: any[];
}

interface NewStoreState {
  employees?: any[];
  cars?: any[];
  paymentMethods?: any[];
  settings?: {
    billing?: {
      type?: string;
      rate?: number;
    };
    tipEnabled?: boolean;
  };
  payments?: any[];
}

/**
 * Translate value from Spanish to English
 */
function translateValue(value: any): any {
  if (typeof value === "string") {
    const translations: Record<string, string> = {
      encargado: "attendant",
      por_hora: "hourly",
      tasa_fija: "flat_rate",
      pago_movil: "mobile_payment",
      automatica: "automatic",
      pendiente: "pending",
      recibido: "received",
    };
    return translations[value] || value;
  }
  return value;
}

/**
 * Migrate employee object from Spanish to English
 */
function migrateEmployee(old: any): any {
  return {
    id: old.id,
    idNumber: old.cedula,
    name: old.nombre,
    photoUrl: old.fotoUrl,
  };
}

/**
 * Migrate car object from Spanish to English
 */
function migrateCar(old: any): any {
  return {
    id: old.id,
    name: old.nombre,
    phone: old.telefono,
    email: old.correo,
    brand: old.marca,
    plate: old.placa,
    model: old.modelo,
    checkInAt: old.checkInAt,
    checkOutAt: old.checkOutAt,
    // qrData: old.qrData, // QR deshabilitado
  };
}

/**
 * Migrate payment method object from Spanish to English
 */
function migratePaymentMethod(old: any): any {
  return {
    id: old.id,
    type: translateValue(old.tipo),
    name: old.nombre,
    form: old.form || "",
    isActive: old.isActive ?? true,
  };
}

/**
 * Migrate payment record object from Spanish to English
 */
function migratePayment(old: any): any {
  return {
    id: old.id,
    carId: old.carId,
    methodId: old.metodoId,
    amountUSD: old.montoUSD,
    tip: old.propina,
    date: old.fecha,
    status: translateValue(old.estado),
  };
}

/**
 * Migrate auth state from Spanish to English
 */
function migrateAuthState(oldState: OldAuthState): NewAuthState {
  if (!oldState.usuario) {
    return {};
  }

  return {
    user: {
      name: oldState.usuario.nombre,
      role: translateValue(oldState.usuario.rol),
    },
  };
}

/**
 * Migrate store state from Spanish to English
 */
function migrateStoreState(oldState: OldStoreState): NewStoreState {
  const newState: NewStoreState = {};

  // Migrate employees
  if (oldState.empleados) {
    newState.employees = oldState.empleados.map(migrateEmployee);
  }

  // Migrate cars
  if (oldState.autos) {
    newState.cars = oldState.autos.map(migrateCar);
  }

  // Migrate payment methods
  if (oldState.metodosPago) {
    newState.paymentMethods = oldState.metodosPago.map(migratePaymentMethod);
  }

  // Migrate settings
  if (oldState.configuracion) {
    newState.settings = {
      billing: oldState.configuracion.cobro
        ? {
            type: translateValue(oldState.configuracion.cobro.tipo) as "hourly" | "flat_rate",
            rate: oldState.configuracion.cobro.tarifa || DEFAULT_SETTINGS.billing.rate,
          }
        : DEFAULT_SETTINGS.billing,
      tipEnabled: oldState.configuracion.propinaHabilitada ?? DEFAULT_SETTINGS.tipEnabled,
    };
  }

  // Migrate payments
  if (oldState.pagos) {
    newState.payments = oldState.pagos.map(migratePayment);
  }

  return newState;
}

/**
 * Main migration function
 * Call this on app initialization to migrate localStorage data
 */
export function migrateLocalStorage(): void {
  try {
    // Check if new keys already exist (migration already done)
    const newAuthExists = safeLocalStorageGet(STORAGE_KEYS.AUTH);
    const newStateExists = safeLocalStorageGet(STORAGE_KEYS.STATE);

    if (newAuthExists && newStateExists) {
      // Migration already complete
      return;
    }

    // Get old data
    const oldAuthData = safeLocalStorageGet(STORAGE_KEYS.AUTH_OLD);
    const oldStateData = safeLocalStorageGet(STORAGE_KEYS.STATE_OLD);

    // Migrate auth if needed
    if (oldAuthData && !newAuthExists) {
      const oldAuth = safeJsonParse<OldAuthState>(oldAuthData, {});
      const newAuth = migrateAuthState(oldAuth);
      safeLocalStorageSet(STORAGE_KEYS.AUTH, JSON.stringify(newAuth));
      console.log("✅ Auth data migrated successfully");
    }

    // Migrate state if needed
    if (oldStateData && !newStateExists) {
      const oldState = safeJsonParse<OldStoreState>(oldStateData, {});
      const newState = migrateStoreState(oldState);
      safeLocalStorageSet(STORAGE_KEYS.STATE, JSON.stringify(newState));
      console.log("✅ Store data migrated successfully");
    }

    // Note: We keep old keys for rollback safety
  } catch (error) {
    logError(error as Error, "migrateLocalStorage");
    console.error("❌ Failed to migrate localStorage data. Old data preserved.");
  }
}
