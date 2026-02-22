import { apiClient } from '../api-client';
import type { UserRole } from './auth-service';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  idNumber?: string;
  isActive: boolean;
  companyUsers?: { company: { id: string; name: string } }[];
}

export interface UsersResponse {
  data: SystemUser[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
  idNumber?: string;
  companyIds?: string[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
}

interface AdminsResponse {
  data: AdminUser[];
}

export const usersService = {
  async getAll(filters?: { search?: string; role?: string; page?: number; limit?: number }): Promise<UsersResponse> {
    const params = new URLSearchParams();
    if (filters?.search) params.set('search', filters.search);
    if (filters?.role) params.set('role', filters.role);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    const query = params.toString();
    return apiClient.get<UsersResponse>(`/users${query ? `?${query}` : ''}`);
  },

  async getAdmins(search?: string): Promise<AdminUser[]> {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    const query = params.toString();
    const response = await apiClient.get<AdminsResponse>(`/users/admins${query ? `?${query}` : ''}`);
    return response.data;
  },

  async createAdmin(data: CreateUserRequest): Promise<SystemUser> {
    return apiClient.post<SystemUser>('/users/admin', data);
  },

  async createStaff(data: CreateUserRequest): Promise<SystemUser> {
    return apiClient.post<SystemUser>('/users/staff', data);
  },

  async update(id: string, data: Partial<Omit<CreateUserRequest, 'password'>>): Promise<SystemUser> {
    return apiClient.patch<SystemUser>(`/users/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/users/${id}`);
  },
};
