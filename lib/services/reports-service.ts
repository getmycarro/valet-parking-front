import { apiClient } from '../api-client';

export interface RevenueReport {
  period: 'day' | 'week' | 'month' | 'custom';
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalPayments: number;
  data: Array<{
    amountUSD: number;
    tip: number;
    date: string;
  }>;
}

export interface VehiclesReport {
  totalVehicles: number;
  activeVehicles: number;
  checkedOutVehicles: number;
}

export interface DashboardSummary {
  activeVehicles: number;
  totalVehiclesToday: number;
  todayRevenue: number;
  totalAttendants: number;
}

/**
 * Servicio de reportes y analytics
 */
export const reportsService = {
  /**
   * Obtener reporte de ingresos
   */
  async getRevenue(
    period: 'day' | 'week' | 'month' | 'custom' = 'week',
    startDate?: string,
    endDate?: string
  ): Promise<RevenueReport> {
    let url = `/reports/revenue?period=${period}`;
    if (period === 'custom' && startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    return apiClient.get<RevenueReport>(url);
  },

  /**
   * Obtener reporte de vehículos
   */
  async getVehicles(startDate?: string, endDate?: string): Promise<VehiclesReport> {
    let url = '/reports/vehicles';
    const params = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return apiClient.get<VehiclesReport>(url);
  },

  /**
   * Obtener resumen del dashboard
   */
  async getSummary(): Promise<DashboardSummary> {
    return apiClient.get<DashboardSummary>('/reports/summary');
  },
};
