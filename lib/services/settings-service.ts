import { apiClient } from '../api-client';

export type BillingType = 'HOURLY' | 'FLAT_RATE';

export interface Settings {
  id: string;
  billingType: BillingType;
  rate: number;
  tipEnabled: boolean;
  updatedAt: string;
}

export interface UpdateBillingRequest {
  billingType: BillingType;
  rate: number;
}

export interface UpdateTipRequest {
  tipEnabled: boolean;
}

/**
 * Servicio de configuración del sistema
 */
export const settingsService = {
  /**
   * Obtener configuración actual
   */
  async get(): Promise<Settings> {
    return apiClient.get<Settings>('/settings');
  },

  /**
   * Actualizar configuración de facturación
   */
  async updateBilling(data: UpdateBillingRequest): Promise<Settings> {
    return apiClient.patch<Settings>('/settings/billing', data);
  },

  /**
   * Actualizar configuración de propinas
   */
  async updateTip(data: UpdateTipRequest): Promise<Settings> {
    return apiClient.patch<Settings>('/settings/tip', data);
  },
};
