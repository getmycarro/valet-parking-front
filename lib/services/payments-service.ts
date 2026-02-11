import { apiClient } from '../api-client';

export type PaymentMethodType = 'ZELLE' | 'MOBILE_PAYMENT' | 'BINANCE' | 'CASH' | 'CARD';
export type ValidationType = 'MANUAL' | 'AUTOMATIC';
export type PaymentStatus = 'PENDING' | 'RECEIVED' | 'CANCELLED';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  name: string;
  form: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  amountUSD: number;
  tip: number;
  status: PaymentStatus;
  date: string;
  fee: string;
  validation: ValidationType;
  parkingRecordId: string;
  paymentMethodId?: string;
  processedById?: string;
  reference?: string;
  note?: string;
  parkingRecord?: any;
  paymentMethod?: PaymentMethod;
  processedBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  parkingRecordId: string;
  paymentMethodId: string;
  amountUSD: number;
  tip?: number;
  fee: string;
  validation: ValidationType;
  reference?: string;
  note?: string;
}

export interface CreatePaymentMethodRequest {
  type: PaymentMethodType;
  name: string;
  form: string;
}

export interface UpdatePaymentStatusRequest {
  status: PaymentStatus;
}

/**
 * Servicio de pagos
 */
export const paymentsService = {
  /**
   * Crear un pago
   */
  async create(data: CreatePaymentRequest): Promise<Payment> {
    return apiClient.post<Payment>('/payments', data);
  },

  /**
   * Obtener todos los pagos
   */
  async getAll(): Promise<Payment[]> {
    return apiClient.get<Payment[]>('/payments');
  },

  /**
   * Actualizar estado de un pago
   */
  async updateStatus(id: string, data: UpdatePaymentStatusRequest): Promise<Payment> {
    return apiClient.patch<Payment>(`/payments/${id}/status`, data);
  },

  /**
   * Crear método de pago
   */
  async createMethod(data: CreatePaymentMethodRequest): Promise<PaymentMethod> {
    return apiClient.post<PaymentMethod>('/payments/methods', data);
  },

  /**
   * Obtener métodos de pago activos
   */
  async getMethods(): Promise<PaymentMethod[]> {
    return apiClient.get<PaymentMethod[]>('/payments/methods');
  },
};
