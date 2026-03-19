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

export type NotificationType =
  | 'CHECKOUT_REQUEST'
  | 'OBJECT_SEARCH_REQUEST'
  | 'APPROACH_COUNTER'
  | 'OBJECT_SEARCH_IN_PROGRESS';

export type NotificationCompany = { id: string; name: string };

export type NotificationUser = { id: string; name: string; email: string };

export type AppNotification = {
  id: string;
  type: NotificationType | string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string; // ISO string
  company: NotificationCompany;
  triggeredBy: NotificationUser | null;
  recipient: NotificationUser | null;
};
