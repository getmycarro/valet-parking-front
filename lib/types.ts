export type Employee = {
  id: string;
  nombre: string;
  cedula: string;
  fotoUrl?: string;
};

export type Car = {
  id: string;
  nombre?: string;
  telefono?: string;
  correo?: string;
  marca?: string;
  placa: string;
  modelo?: string;
  color?: string;
  checkInAt: number;
  checkOutAt?: number;
  valetId?: string;
  qrData?: string;
};

export type PaymentMethodType = "zelle" | "pago_movil" | "binance";
export type ValidationType = "manual" | "automatica";

export type PaymentMethod = {
  id: string;
  tipo: PaymentMethodType;
  validacion: ValidationType;
  nombre: string;
  detalles?: Record<string, string>;
  comisionMensualPorcentaje?: number;
};

export type ChargeMethodType = "por_hora" | "tasa_fija";

export type Settings = {
  cobro: {
    tipo: ChargeMethodType;
    tarifa: number;
  };
  propinaHabilitada: boolean;
};

export type PaymentStatus = "pendiente" | "recibido";

export type PaymentRecord = {
  id: string;
  carId: string;
  metodoId: string;
  montoUSD: number;
  propina: boolean;
  fecha: number;
  estado: PaymentStatus;
};
