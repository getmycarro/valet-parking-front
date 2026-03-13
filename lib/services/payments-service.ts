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
  companyId?: string | null;
  company?: { id: string; name: string } | null;
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

export interface PaymentsListResponse {
  data: Payment[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    // Contadores estáticos por estado (incluyen todos los registros, no solo la página actual)
    pending: number;          // Pagos pendientes
    cancelled: number;        // Pagos cancelados
    completed: number;        // Pagos completados (RECEIVED)
    all: number;              // Total de pagos
    cancelledAmountUSD: number
    pendingAmountUSD: number
    completedAmountUSD: number
  };
}

export interface PaymentFilterParams {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'RECEIVED' | 'CANCELLED' | 'all';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  companyId?: string;
  validation?: ValidationType;
  sortBy?: 'createdAt' | 'amountUSD' | 'paymentMethod';
  sortOrder?: 'asc' | 'desc';
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

export interface UpdatePaymentMethodRequest {
  type?: PaymentMethodType;
  name?: string;
  form?: string;
  isActive?: boolean;
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
   * Obtener todos los pagos con paginación y filtros
   *
   * Reglas de construcción de query:
   * - Siempre incluir: page, limit
   * - Incluir companyId SOLO si está definido y no es null
   * - Incluir status, search, dateFrom, dateTo, validation SOLO si tienen valor
   */
  async getAll(
    params: PaymentFilterParams = {},
  ): Promise<PaymentsListResponse> {
    const searchParams = new URLSearchParams();

    // Parámetros obligatorios: page y limit
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    searchParams.append("page", String(page));
    searchParams.append("limit", String(limit));

    // Parámetro especial: companyId (solo si está definido y NO es null)
    if (params.companyId && params.companyId !== "null") {
      searchParams.append("companyId", params.companyId);
    }

    // Parámetros opcionales de filtro (solo si tienen valor)
    const optionalParams = ["status", "search", "dateFrom", "dateTo", "validation", "sortBy", "sortOrder"];
    optionalParams.forEach((key) => {
      const value = params[key as keyof PaymentFilterParams];
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    const url = `/payments?${queryString}`;
    return apiClient.get<PaymentsListResponse>(url);
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

  /**
   * Obtener métodos de pago de una company
   */
  async getCompanyMethods(companyId: string): Promise<PaymentMethod[]> {
    return apiClient.get<PaymentMethod[]>(`/companies/${companyId}/payment-methods`);
  },

  /**
   * Registrar un método de pago para una company
   */
  async createCompanyMethod(companyId: string, data: CreatePaymentMethodRequest): Promise<PaymentMethod> {
    return apiClient.post<PaymentMethod>(`/companies/${companyId}/payment-methods`, data);
  },

  /**
   * Editar un método de pago de una company
   */
  async updateCompanyMethod(companyId: string, methodId: string, data: UpdatePaymentMethodRequest): Promise<PaymentMethod> {
    return apiClient.patch<PaymentMethod>(`/companies/${companyId}/payment-methods/${methodId}`, data);
  },
};
