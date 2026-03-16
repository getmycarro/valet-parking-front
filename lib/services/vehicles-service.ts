import { apiClient } from "../api-client";

export type ParkingRecordStatus = "UNPAID" | "PAID" | "FREE";

export interface ParkingRecord {
  id: string;
  plate: string;
  brand?: string;
  model?: string;
  color?: string;
  status: ParkingRecordStatus;
  checkInAt: string; // ISO date string
  checkOutAt?: string; // ISO date string
  // qrData?: string; // QR deshabilitado
  checkInValetId?: string;
  checkOutValetId?: string;
  registerRecordId?: string;
  ownerId?: string;
  registerRecord?: {
    id: string;
    name: string;
    idNumber?: string;
  };
  checkInValet?: {
    id: string;
    name: string;
    idNumber?: string;
  };
  checkOutValet?: {
    id: string;
    name: string;
    idNumber?: string;
  };
  payments?: any[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterVehicleRequest {
  plate: string;
  brand?: string;
  model?: string;
  color?: string;
  ownerId?: string;
  idNumber?: string;
  email?: string;
  name?: string;
  userId?: string;
  vehicleId?: string;
  valedId?: string;
  companyId?: string;
}

export interface UserWithVehicles {
  id: string;
  email: string;
  name?: string;
  idNumber?: string;
  phone?: string;
  ownedVehicles: {
    id: string;
    plate: string;
    brand?: string;
    model?: string;
    color?: string;
  }[];
}

// QR deshabilitado
// export interface RegisterVehicleQRRequest {
//   vehicleId: string;
//   qrData: string;
// }

export interface CheckoutVehicleRequest {
  checkOutAt?: Date;
  checkOutValet?: string;
  notes?: string;
}

export interface ValetInfo {
  id: string;
  name: string;
  idNumber: string;
}

export interface VehiclesListResponse {
  data: ParkingRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    // Contadores estáticos por estado (incluyen todos los registros, no solo la página actual)
    active: number;              // Vehículos UNPAID
    pending_delivery: number;    // Vehículos PAID, pendientes de entrega
    completed: number;           // Vehículos FREE (entregados)
    all: number;                 // Total sin filtro de status
  };
}

export interface VehicleFilterParams {
  page?: number;
  limit?: number;
  plate?: string;
  brand?: string;
  model?: string;
  color?: string;
  status?: "active" | "completed" | "pending_delivery" | "all";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  companyId?: string;
}

export interface VehiclesCounters {
  active: number;
  pending_delivery: number;
  completed: number;
  all: number;
}

/**
 * Servicio de vehículos (parking records)
 */
export const vehiclesService = {
  /**
   * Registrar vehículo manualmente
   */
  async registerManual(data: RegisterVehicleRequest): Promise<ParkingRecord> {
    return apiClient.post<ParkingRecord>("/vehicles/register", data);
  },

  // /**
  //  * Registrar vehículo por QR
  //  */
  // async registerQR(data: RegisterVehicleQRRequest): Promise<ParkingRecord> {
  //   return apiClient.post<ParkingRecord>('/vehicles/register/qr', data);
  // }, // QR deshabilitado

  /**
   * Marcar salida de vehículo (checkout)
   */
  async checkout(
    id: string,
    data: CheckoutVehicleRequest,
  ): Promise<ParkingRecord> {
    return apiClient.patch<ParkingRecord>(`/vehicles/${id}/checkout`, data);
  },

  /**
   * Buscar vehículos por cédula del empleado
   */
  async searchByEmployee(idNumber: string): Promise<ParkingRecord[]> {
    return apiClient.get<ParkingRecord[]>(
      `/vehicles/search?idNumber=${idNumber}`,
    );
  },

  /**
   * Obtener vehículos activos (no entregados) con filtros opcionales
   * ⚠️ DEPRECATED: Usar getAll() en su lugar
   * Retorna objeto con data y meta (paginación)
   */
  async getVehicles(
    params: Omit<VehicleFilterParams, "page" | "limit"> = {},
  ): Promise<VehiclesListResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    const url = queryString ? `/vehicles?${queryString}` : "/vehicles";

    return apiClient.get<VehiclesListResponse>(url);
  },

  /**
   * Obtener vehículo por ID
   */
  async getById(id: string): Promise<ParkingRecord> {
    return apiClient.get<ParkingRecord>(`/vehicles/${id}`);
  },

  /**
   * Obtener todos los vehículos con paginación y filtros
   *
   * Reglas de construcción de query:
   * - Siempre incluir: page, limit
   * - Incluir companyId SOLO si está definido y no es null
   * - Incluir status, search, plate, brand, model, color, dateFrom, dateTo SOLO si tienen valor
   */
  async getAll(
    params: VehicleFilterParams = {},
  ): Promise<VehiclesListResponse> {
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
    const optionalParams = ["status", "search", "plate", "brand", "model", "color", "dateFrom", "dateTo"];
    optionalParams.forEach((key) => {
      const value = params[key as keyof VehicleFilterParams];
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    const url = `/vehicles?${queryString}`;
    return apiClient.get<VehiclesListResponse>(url);
  },

  /**
   * Buscar usuario y sus vehiculos por cedula
   */
  async getUserVehicles(idNumber: string): Promise<UserWithVehicles | null> {
    return apiClient.get<UserWithVehicles | null>(
      `/vehicles/user-vehicles?idNumber=${encodeURIComponent(idNumber)}`,
    );
  },

  /**
   * Obtener lista de valets
   */
  async getValets(): Promise<ValetInfo[]> {
    return apiClient.get<ValetInfo[]>("/vehicles/valets");
  },

};
