"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import type {
  Employee,
  Car,
  PaymentMethod,
  Settings,
  PaymentRecord,
  ChargeMethodType,
  PaymentStatus,
} from "@/lib/types";

type State = {
  empleados: Employee[];
  autos: Car[];
  metodosPago: PaymentMethod[];
  configuracion: Settings;
  pagos: PaymentRecord[];
};

type Action =
  | { type: "init"; payload: State }
  | { type: "addEmpleado"; payload: Employee }
  | { type: "removeEmpleado"; payload: string }
  | { type: "registrarAutoManual"; payload: Omit<Car, "id" | "checkInAt"> }
  | { type: "registrarAutoQR"; payload: { placa: string; qrData: string } }
  | { type: "entregarAuto"; payload: { carId: string } }
  | { type: "addMetodoPago"; payload: PaymentMethod }
  | { type: "updateCobro"; payload: { tipo: ChargeMethodType; tarifa: number } }
  | { type: "setPropina"; payload: boolean }
  | { type: "addPago"; payload: PaymentRecord }
  | {
      type: "updatePagoEstado";
      payload: { pagoId: string; estado: PaymentStatus };
    };

const initialState: State = {
  empleados: [],
  autos: [],
  metodosPago: [],
  configuracion: {
    cobro: { tipo: "tasa_fija", tarifa: 5 },
    propinaHabilitada: true,
  },
  pagos: [],
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function reducer(state: State, action: Action): State {
  if (action.type === "init") return action.payload;
  if (action.type === "addEmpleado")
    return { ...state, empleados: [action.payload, ...state.empleados] };
  if (action.type === "removeEmpleado")
    return {
      ...state,
      empleados: state.empleados.filter((e) => e.id !== action.payload),
    };
  if (action.type === "registrarAutoManual") {
    const id = uid();
    const checkInAt = Date.now();
    const qrData = JSON.stringify({
      type: "valet_ticket",
      v: 1,
      carId: id,
      placa: action.payload.placa,
      checkInAt,
    });
    const car: Car = {
      id,
      placa: action.payload.placa,
      nombre: action.payload.nombre,
      telefono: action.payload.telefono,
      correo: action.payload.correo,
      marca: action.payload.marca,
      modelo: action.payload.modelo,
      color: action.payload.color,
      checkInAt,
      qrData,
    };
    return { ...state, autos: [car, ...state.autos] };
  }
  if (action.type === "registrarAutoQR") {
    const id = uid();
    const car: Car = {
      id,
      placa: action.payload.placa,
      qrData: action.payload.qrData,
      checkInAt: Date.now(),
    };
    return { ...state, autos: [car, ...state.autos] };
  }
  if (action.type === "entregarAuto") {
    return {
      ...state,
      autos: state.autos.map((a) =>
        a.id === action.payload.carId ? { ...a, checkOutAt: Date.now() } : a
      ),
    };
  }
  if (action.type === "addMetodoPago")
    return { ...state, metodosPago: [action.payload, ...state.metodosPago] };
  if (action.type === "updateCobro")
    return {
      ...state,
      configuracion: {
        ...state.configuracion,
        cobro: { tipo: action.payload.tipo, tarifa: action.payload.tarifa },
      },
    };
  if (action.type === "setPropina")
    return {
      ...state,
      configuracion: {
        ...state.configuracion,
        propinaHabilitada: action.payload,
      },
    };
  if (action.type === "addPago")
    return { ...state, pagos: [action.payload, ...state.pagos] };
  if (action.type === "updatePagoEstado")
    return {
      ...state,
      pagos: state.pagos.map((p) =>
        p.id === action.payload.pagoId
          ? { ...p, estado: action.payload.estado }
          : p
      ),
    };
  return state;
}

type StoreCtx = {
  state: State;
  addEmpleado: (d: Omit<Employee, "id">) => void;
  removeEmpleado: (id: string) => void;
  registrarAutoManual: (
    d: Omit<Car, "id" | "checkInAt" | "checkOutAt" | "valetId" | "qrData">
  ) => void;
  registrarAutoQR: (qr: string) => void;
  entregarAuto: (id: string) => void;
  addMetodoPago: (m: Omit<PaymentMethod, "id">) => void;
  updateCobro: (tipo: ChargeMethodType, tarifa: number) => void;
  setPropina: (v: boolean) => void;
  addPago: (d: Omit<PaymentRecord, "id" | "fecha">) => void;
  updatePagoEstado: (id: string, estado: PaymentStatus) => void;
  calcularMonto: (car: Car) => number;
};

const Ctx = createContext<StoreCtx | null>(null);

const STORAGE_KEY = "valet_parking_state";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: State = JSON.parse(raw);
        dispatch({ type: "init", payload: parsed });
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const api = useMemo<StoreCtx>(
    () => ({
      state,
      addEmpleado: (d: Omit<Employee, "id">) => {
        const e: Employee = {
          id: uid(),
          nombre: d.nombre,
          cedula: d.cedula,
          fotoUrl: d.fotoUrl,
        };
        dispatch({ type: "addEmpleado", payload: e });
      },
      removeEmpleado: (id: string) =>
        dispatch({ type: "removeEmpleado", payload: id }),
      registrarAutoManual: (
        d: Omit<Car, "id" | "checkInAt" | "checkOutAt" | "valetId" | "qrData">
      ) => dispatch({ type: "registrarAutoManual", payload: d }),
      registrarAutoQR: (qr: string) => {
        try {
          const maybe = JSON.parse(qr);
          const placa =
            typeof maybe.placa === "string"
              ? maybe.placa
              : String(maybe.placa || "");
          if (placa)
            dispatch({
              type: "registrarAutoQR",
              payload: { placa, qrData: qr },
            });
          else
            dispatch({
              type: "registrarAutoQR",
              payload: { placa: qr, qrData: qr },
            });
        } catch {
          dispatch({
            type: "registrarAutoQR",
            payload: { placa: qr, qrData: qr },
          });
        }
      },
      entregarAuto: (id: string) =>
        dispatch({ type: "entregarAuto", payload: { carId: id } }),
      addMetodoPago: (m: Omit<PaymentMethod, "id">) => {
        const pm: PaymentMethod = {
          id: uid(),
          tipo: m.tipo,
          validacion: m.validacion,
          nombre: m.nombre,
          detalles: m.detalles,
          comisionMensualPorcentaje: m.comisionMensualPorcentaje,
        };
        dispatch({ type: "addMetodoPago", payload: pm });
      },
      updateCobro: (tipo: ChargeMethodType, tarifa: number) =>
        dispatch({ type: "updateCobro", payload: { tipo, tarifa } }),
      setPropina: (v: boolean) => dispatch({ type: "setPropina", payload: v }),
      addPago: (d: Omit<PaymentRecord, "id" | "fecha">) => {
        const p: PaymentRecord = {
          id: uid(),
          carId: d.carId,
          metodoId: d.metodoId,
          montoUSD: d.montoUSD,
          propina: d.propina,
          fecha: Date.now(),
          estado: d.estado,
        };
        dispatch({ type: "addPago", payload: p });
      },
      updatePagoEstado: (id: string, estado: PaymentStatus) =>
        dispatch({ type: "updatePagoEstado", payload: { pagoId: id, estado } }),
      calcularMonto: (car: Car) => {
        const conf = state.configuracion.cobro;
        if (conf.tipo === "tasa_fija") return conf.tarifa;
        const end = car.checkOutAt || Date.now();
        const horas = Math.max(
          1,
          Math.ceil((end - car.checkInAt) / (1000 * 60 * 60))
        );
        return conf.tarifa * horas;
      },
    }),
    [state]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("store");
  return v;
}
