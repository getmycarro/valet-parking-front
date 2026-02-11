"use client";

/**
 * Global State Management Store
 * Uses React Context + useReducer pattern with API integration
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useCallback,
  useState,
} from "react";
import type {
  Car,
  PaymentMethod,
  Settings,
  PaymentRecord,
  BillingType,
  PaymentStatus,
  Employee,
} from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import { StoreError, logError } from "@/lib/utils/errors";
import { getDurationInHours } from "@/lib/utils/time";
import { vehiclesService } from "@/lib/services/vehicles-service";
import { paymentsService } from "@/lib/services/payments-service";
import { settingsService } from "@/lib/services/settings-service";
import { employeesService, type CreateEmployeeRequest } from "@/lib/services/employees-service";
import { useAuth } from "@/lib/auth";

type State = {
  cars: Car[];
  paymentMethods: PaymentMethod[];
  settings: Settings;
  payments: PaymentRecord[];
  employees: Employee[];
};

type DeliverCarPayload = {
  carId: string;
  checkOutAt: number;
  checkOutValetId?: string;
  checkOutValet?: { id: string; name: string; email: string };
};

type Action =
  | { type: "init"; payload: State }
  | { type: "registerCarManual"; payload: Car }
  // | { type: "registerCarQR"; payload: Car } // QR deshabilitado
  | { type: "deliverCar"; payload: DeliverCarPayload }
  | { type: "addPaymentMethod"; payload: PaymentMethod }
  | { type: "updateBilling"; payload: { type: BillingType; rate: number } }
  | { type: "setTipEnabled"; payload: boolean }
  | { type: "addPayment"; payload: PaymentRecord }
  | {
      type: "updatePaymentStatus";
      payload: { paymentId: string; status: PaymentStatus };
    }
  | { type: "setEmployees"; payload: Employee[] }
  | { type: "addEmployee"; payload: Employee }
  | { type: "removeEmployee"; payload: string };

const initialState: State = {
  cars: [],
  paymentMethods: [],
  settings: DEFAULT_SETTINGS,
  payments: [],
  employees: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "init":
      return action.payload;

    case "registerCarManual": {
      return { ...state, cars: [action.payload, ...state.cars] };
    }

    // case "registerCarQR": { // QR deshabilitado
    //   return { ...state, cars: [action.payload, ...state.cars] };
    // }

    case "deliverCar":
      return {
        ...state,
        cars: state.cars.map((a) =>
          a.id === action.payload.carId
            ? {
                ...a,
                checkOutAt: action.payload.checkOutAt,
                checkOutValetId: action.payload.checkOutValetId,
                checkOutValet: action.payload.checkOutValet,
              }
            : a
        ),
      };

    case "addPaymentMethod":
      return { ...state, paymentMethods: [action.payload, ...state.paymentMethods] };

    case "updateBilling":
      return {
        ...state,
        settings: {
          ...state.settings,
          billing: { type: action.payload.type, rate: action.payload.rate },
        },
      };

    case "setTipEnabled":
      return {
        ...state,
        settings: {
          ...state.settings,
          tipEnabled: action.payload,
        },
      };

    case "addPayment":
      return { ...state, payments: [action.payload, ...state.payments] };

    case "updatePaymentStatus":
      return {
        ...state,
        payments: state.payments.map((p) =>
          p.id === action.payload.paymentId
            ? { ...p, status: action.payload.status }
            : p
        ),
      };

    case "setEmployees":
      return { ...state, employees: action.payload };

    case "addEmployee":
      return { ...state, employees: [...state.employees, action.payload] };

    case "removeEmployee":
      return { ...state, employees: state.employees.filter((e) => e.id !== action.payload) };

    default:
      return state;
  }
}

export type RegisterCarInput = {
  plate: string;
  brand?: string;
  model?: string;
  color?: string;
  idNumber?: string;
  email?: string;
  name?: string;
  userId?: string;
  vehicleId?: string;
  valedId?: string;
};

type StoreCtx = {
  state: State;
  isLoading: boolean;
  registerCarManual: (d: RegisterCarInput) => Promise<void>;
  // registerCarQR: (qr: string) => Promise<void>; // QR deshabilitado
  deliverCar: (id: string, checkOutValet?: string, notes?: string) => Promise<void>;
  addPaymentMethod: (m: Omit<PaymentMethod, "id">) => Promise<void>;
  updateBilling: (type: BillingType, rate: number) => Promise<void>;
  setTipEnabled: (v: boolean) => Promise<void>;
  addPayment: (d: Omit<PaymentRecord, "id" | "date"> & { paymentMethodId: string; fee: string; validation: "MANUAL" | "AUTOMATIC"; reference?: string; note?: string }) => Promise<void>;
  updatePaymentStatus: (id: string, status: PaymentStatus) => Promise<void>;
  calculateAmount: (car: Car) => number;
  addEmployee: (data: CreateEmployeeRequest) => Promise<void>;
  removeEmployee: (id: string, type: 'VALET' | 'ATTENDANT') => Promise<void>;
};

const Ctx = createContext<StoreCtx | null>(null);

function mapParkingRecordToCar(record: any): Car {
  return {
    id: record.id,
    plate: record.plate,
    brand: record.brand,
    model: record.model,
    color: record.color,
    checkInAt: new Date(record.checkInAt).getTime(),
    checkOutAt: record.checkOutAt ? new Date(record.checkOutAt).getTime() : undefined,
    // qrData: record.qrData, // QR deshabilitado
    checkInValetId: record.checkInValetId,
    checkOutValetId: record.checkOutValetId,
    checkInValet: record.checkInValet,
    checkOutValet: record.checkOutValet,
    ownerId: record.ownerId,
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load initial data from API when user authenticates
  useEffect(() => {
    async function loadData() {
      // Skip API calls if user is not authenticated
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Cargar datos en paralelo desde la API
        const [settingsData, paymentMethodsData, activeCarsData, employeesData] = await Promise.all([
          settingsService.get(),
          paymentsService.getMethods(),
          vehiclesService.getActive(),
          employeesService.getAll(),
        ]);
        console.log('🔍 [StoreProvider.loadData] employeesData:', employeesData);

        const cars: Car[] = activeCarsData.map(mapParkingRecordToCar);

        const settings: Settings = {
          billing: {
            type: settingsData.billingType.toLowerCase() as BillingType,
            rate: settingsData.rate,
          },
          tipEnabled: settingsData.tipEnabled,
        };

        const paymentMethods: PaymentMethod[] = paymentMethodsData.map((pm) => ({
          id: pm.id,
          type: pm.type.toLowerCase() as any,
          name: pm.name,
          form: pm.form,
          isActive: pm.isActive,
        }));

        dispatch({
          type: "init",
          payload: {
            cars,
            paymentMethods,
            settings,
            payments: [],
            employees: employeesData,
          },
        });
      } catch (error) {
        logError(error as Error, "StoreProvider.loadData");
        dispatch({
          type: "init",
          payload: {
            cars: [],
            paymentMethods: [],
            settings: DEFAULT_SETTINGS,
            payments: [],
            employees: [],
          },
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user]);

  // Memoize expensive calculation function
  const calculateAmount = useCallback(
    (car: Car) => {
      const billing = state.settings.billing;
      if (billing.type === "flat_rate") {
        return billing.rate;
      }
      const end = car.checkOutAt || Date.now();
      const hours = getDurationInHours(car.checkInAt, end);
      const roundedHours = Math.max(1, Math.ceil(hours));
      return billing.rate * roundedHours;
    },
    [state.settings.billing]
  );

  const api = useMemo<StoreCtx>(
    () => ({
      state,
      isLoading,
      registerCarManual: async (d: RegisterCarInput) => {
        try {
          const parkingRecord = await vehiclesService.registerManual({
            plate: d.plate,
            brand: d.brand,
            model: d.model,
            color: d.color,
            idNumber: d.idNumber,
            email: d.email,
            name: d.name,
            userId: d.userId,
            vehicleId: d.vehicleId,
            valedId: d.valedId,
          });

          const car = mapParkingRecordToCar(parkingRecord);
          dispatch({ type: "registerCarManual", payload: car });
        } catch (error) {
          logError(error as Error, "registerCarManual");
          throw error;
        }
      },
      // registerCarQR deshabilitado
      // registerCarQR: async (qr: string) => {
      //   try {
      //     const qrData = JSON.parse(qr);
      //     const vehicleId =
      //       typeof qrData.vehicleId === "string"
      //         ? qrData.vehicleId
      //         : String(qrData.vehicleId || "");
      //
      //     if (!vehicleId) {
      //       throw new Error("Invalid QR code: vehicleId not found");
      //     }
      //
      //     const parkingRecord = await vehiclesService.registerQR({
      //       vehicleId,
      //       qrData: qr,
      //     });
      //
      //     const car = mapParkingRecordToCar(parkingRecord);
      //     dispatch({ type: "registerCarQR", payload: car });
      //   } catch (error) {
      //     logError(error as Error, "registerCarQR");
      //     throw error;
      //   }
      // },
      deliverCar: async (id: string, checkOutValet?: string, notes?: string) => {
        try {
          const updatedRecord = await vehiclesService.checkout(id, {
            checkOutValet,
            notes,
          });
          dispatch({
            type: "deliverCar",
            payload: {
              carId: id,
              checkOutAt: new Date(updatedRecord.checkOutAt!).getTime(),
              checkOutValetId: updatedRecord.checkOutValetId,
              checkOutValet: updatedRecord.checkOutValet,
            },
          });
        } catch (error) {
          logError(error as Error, "deliverCar");
          throw error;
        }
      },
      addPaymentMethod: async (m: Omit<PaymentMethod, "id">) => {
        try {
          const created = await paymentsService.createMethod({
            type: m.type.toUpperCase() as any,
            name: m.name,
            form: m.form,
          });

          const pm: PaymentMethod = {
            id: created.id,
            type: created.type.toLowerCase() as any,
            name: created.name,
            form: created.form,
            isActive: created.isActive,
          };
          dispatch({ type: "addPaymentMethod", payload: pm });
        } catch (error) {
          logError(error as Error, "addPaymentMethod");
          throw error;
        }
      },
      updateBilling: async (type: BillingType, rate: number) => {
        try {
          await settingsService.updateBilling({
            billingType: type.toUpperCase() as any,
            rate,
          });
          dispatch({ type: "updateBilling", payload: { type, rate } });
        } catch (error) {
          logError(error as Error, "updateBilling");
          throw error;
        }
      },
      setTipEnabled: async (v: boolean) => {
        try {
          await settingsService.updateTip({ tipEnabled: v });
          dispatch({ type: "setTipEnabled", payload: v });
        } catch (error) {
          logError(error as Error, "setTipEnabled");
          throw error;
        }
      },
      addPayment: async (d: Omit<PaymentRecord, "id" | "date"> & { paymentMethodId: string; fee: string; validation: "MANUAL" | "AUTOMATIC"; reference?: string; note?: string }) => {
        try {
          const created = await paymentsService.create({
            parkingRecordId: d.parkingRecordId,
            paymentMethodId: d.paymentMethodId,
            amountUSD: d.amountUSD,
            tip: d.tip,
            fee: d.fee,
            validation: d.validation,
            reference: d.reference,
            note: d.note,
          });

          const p: PaymentRecord = {
            id: created.id,
            parkingRecordId: d.parkingRecordId,
            methodId: d.paymentMethodId,
            amountUSD: d.amountUSD,
            tip: created.tip,
            date: new Date(created.date).getTime(),
            status: created.status.toLowerCase() as PaymentStatus,
          };
          dispatch({ type: "addPayment", payload: p });
        } catch (error) {
          logError(error as Error, "addPayment");
          throw error;
        }
      },
      updatePaymentStatus: async (id: string, status: PaymentStatus) => {
        try {
          await paymentsService.updateStatus(id, {
            status: status.toUpperCase() as any,
          });
          dispatch({ type: "updatePaymentStatus", payload: { paymentId: id, status } });
        } catch (error) {
          logError(error as Error, "updatePaymentStatus");
          throw error;
        }
      },
      addEmployee: async (data: CreateEmployeeRequest) => {
        try {
          const created = await employeesService.create(data);
          dispatch({ type: "addEmployee", payload: created });
        } catch (error) {
          logError(error as Error, "addEmployee");
          throw error;
        }
      },
      removeEmployee: async (id: string, type: 'VALET' | 'ATTENDANT') => {
        try {
          await employeesService.delete(id, type);
          dispatch({ type: "removeEmployee", payload: id });
        } catch (error) {
          logError(error as Error, "removeEmployee");
          throw error;
        }
      },
      calculateAmount,
    }),
    [state, isLoading, calculateAmount]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new StoreError("useStore must be used within StoreProvider");
  }
  return ctx;
}
