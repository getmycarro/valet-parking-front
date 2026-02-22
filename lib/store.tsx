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
  useState,
} from "react";
import type {
  Car,
  PaymentMethod,
  PaymentRecord,
  PaymentStatus,
  Employee,
} from "@/lib/types";
import { StoreError, logError } from "@/lib/utils/errors";
import { vehiclesService } from "@/lib/services/vehicles-service";
import { paymentsService } from "@/lib/services/payments-service";
import { employeesService, type CreateEmployeeRequest } from "@/lib/services/employees-service";
import { useAuth } from "@/lib/auth";

type State = {
  cars: Car[];
  paymentMethods: PaymentMethod[];
  payments: PaymentRecord[];
  employees: Employee[];
};

type DeliverCarPayload = {
  carId: string;
  checkOutAt: number;
  checkOutValetId?: string;
  checkOutValet?: { id: string; name: string; idNumber?: string };
};

type Action =
  | { type: "init"; payload: State }
  | { type: "registerCarManual"; payload: Car }
  | { type: "deliverCar"; payload: DeliverCarPayload }
  | { type: "addPaymentMethod"; payload: PaymentMethod }
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
  deliverCar: (id: string, checkOutValet?: string, notes?: string) => Promise<void>;
  addPaymentMethod: (m: Omit<PaymentMethod, "id">) => Promise<void>;
  addPayment: (d: Omit<PaymentRecord, "id" | "date"> & { paymentMethodId: string; fee: string; validation: "MANUAL" | "AUTOMATIC"; reference?: string; note?: string }) => Promise<void>;
  updatePaymentStatus: (id: string, status: PaymentStatus) => Promise<void>;
  addEmployee: (data: CreateEmployeeRequest) => Promise<void>;
  removeEmployee: (id: string, type: 'VALET' | 'ATTENDANT' | 'MANAGER') => Promise<void>;
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
      if (!user) {
        setIsLoading(false);
        return;
      }

      // super_admin doesn't use vehicles/payments/employees
      if (user.role === "super_admin") {
        dispatch({
          type: "init",
          payload: { cars: [], paymentMethods: [], payments: [], employees: [] },
        });
        setIsLoading(false);
        return;
      }

      try {
        const [paymentMethodsData, vehiclesResponse, employeesData] = await Promise.all([
          paymentsService.getMethods(),
          vehiclesService.getVehicles(),
          employeesService.getAll(),
        ]);
        const cars: Car[] = vehiclesResponse.data.map(mapParkingRecordToCar);

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
      removeEmployee: async (id: string, type: 'VALET' | 'ATTENDANT' | 'MANAGER') => {
        try {
          await employeesService.delete(id, type);
          dispatch({ type: "removeEmployee", payload: id });
        } catch (error) {
          logError(error as Error, "removeEmployee");
          throw error;
        }
      },
    }),
    [state, isLoading]
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
