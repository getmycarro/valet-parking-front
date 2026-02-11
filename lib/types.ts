export type ValetInfo = {
  id: string;
  name: string;
  email?: string;
  idNumber?: string;
};

export type Car = {
  id: string;
  plate: string;
  brand?: string;
  model?: string;
  color?: string;
  checkInAt: number;
  checkOutAt?: number;
  checkInValetId?: string;
  checkOutValetId?: string;
  checkInValet?: ValetInfo;
  checkOutValet?: ValetInfo;
  ownerId?: string;
  // qrData?: string; // QR deshabilitado
};

export type PaymentMethodType = "zelle" | "mobile_payment" | "binance" | "cash" | "card";
export type ValidationType = "manual" | "automatic";

export type PaymentMethod = {
  id: string;
  type: PaymentMethodType;
  name: string;
  form: string;
  isActive: boolean;
};

export type BillingType = "hourly" | "flat_rate";

export type Settings = {
  billing: {
    type: BillingType;
    rate: number;
  };
  tipEnabled: boolean;
};

export type PaymentStatus = "pending" | "received" | "cancelled";

export type PaymentRecord = {
  id: string;
  parkingRecordId: string;
  methodId: string;
  amountUSD: number;
  tip: number;
  date: number;
  status: PaymentStatus;
};

export type Employee = {
  id: string;
  name: string;
  idNumber: string;
  type: 'VALET' | 'ATTENDANT';
  email?: string;
  photoUrl?: string;
};
