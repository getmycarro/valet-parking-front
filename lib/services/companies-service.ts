import { apiClient } from "../api-client";

export interface CompanyInvoice {
  id: string;
  companyPlanId: string;
  amountUSD: number;
  status: "PENDING" | "RECEIVED" | "CANCELLED";
  planType: string;
  vehicleCount?: number | null;
  baseAmount?: number | null;
  vehicleAmount?: number | null;
  feeAmount?: number | null;
  periodStart: string | null;
  periodEnd: string | null;
  reference?: string | null;
  note?: string | null;
  date: string;
  validation?: string | null;
  paymentMethodId?: string | null;
}

export interface CompanyPlan {
  id: string;
  companyId: string;
  planType: "FLAT_RATE" | "PER_VEHICLE" | "MIXED";
  flatRate?: number | null;
  perVehicleRate?: number | null;
  feeType?: "PERCENTAGE" | "FIXED" | null;
  feeValue?: number | null;
  basePrice?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  companyInvoices: CompanyInvoice[];
}

export interface CompanyUserDetail {
  id: string;
  userId: string;
  companyId: string;
  joinedAt: string;
  isActive: boolean;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    phone: string | null;
    idNumber: string | null;
    isActive: boolean;
  };
}

export interface Company {
  id: string;
  name: string;
  photoUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  plans: CompanyPlan[];
}

export interface CompaniesResponse {
  data: Company[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CompanyFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CompanyDetail extends Company {
  companyUsers: CompanyUserDetail[];
}

export interface CreateCompanyRequest {
  name: string;
  userIds: string[];
}

export interface CreatePlanRequest {
  planType: "FLAT_RATE" | "PER_VEHICLE" | "MIXED";
  flatRate?: number;
  perVehicleRate?: number;
  feeType?: "PERCENTAGE" | "FIXED";
  feeValue?: number;
  basePrice?: number;
}

export interface UpdatePlanRequest extends Partial<CreatePlanRequest> {
  isActive?: boolean;
}

export const companiesService = {
  async getAll(filters?: CompanyFilters): Promise<CompaniesResponse> {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.isActive !== undefined)
      params.set("isActive", String(filters.isActive));
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.limit) params.set("limit", String(filters.limit));

    const query = params.toString();
    return apiClient.get<CompaniesResponse>(
      `/companies${query ? `?${query}` : ""}`,
    );
  },

  async getOne(id: string): Promise<CompanyDetail> {
    return apiClient.get<CompanyDetail>(`/companies/${id}`);
  },

  async create(data: CreateCompanyRequest): Promise<Company> {
    return apiClient.post<Company>("/companies", data);
  },

  async update(
    id: string,
    data: Partial<CreateCompanyRequest> & { isActive?: boolean },
  ): Promise<CompanyDetail> {
    return apiClient.patch<CompanyDetail>(`/companies/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/companies/${id}`);
  },

  async createPlan(
    companyId: string,
    data: CreatePlanRequest,
  ): Promise<CompanyPlan> {
    return apiClient.post<CompanyPlan>(`/companies/${companyId}/plans`, data);
  },

  async updatePlan(
    companyId: string,
    planId: string,
    data: UpdatePlanRequest,
  ): Promise<CompanyPlan> {
    return apiClient.patch<CompanyPlan>(
      `/companies/${companyId}/plans/${planId}`,
      data,
    );
  },

  async updateInvoice(
    companyId: string,
    planId: string,
    invoiceId: string,
    data: Partial<CompanyInvoice>,
  ): Promise<CompanyInvoice> {
    return apiClient.patch<CompanyInvoice>(
      `/companies/${companyId}/plans/${planId}/invoices/${invoiceId}`,
      data,
    );
  },
};
