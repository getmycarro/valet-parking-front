import { apiClient } from '../api-client';

export interface Employee {
  id: string;
  name: string;
  idNumber: string;
  type: 'VALET' | 'ATTENDANT';
  email?: string;
  photoUrl?: string;
}

export interface CreateEmployeeRequest {
  name: string;
  idNumber: string;
  type: 'VALET' | 'ATTENDANT';
  email?: string;
}

export const employeesService = {
  /**
   * Create a new employee (Valet or Attendant)
   */
  async create(data: CreateEmployeeRequest): Promise<Employee> {
    return apiClient.post<Employee>('/employees', data);
  },

  /**
   * Get all employees (Valets and Attendants)
   */
  async getAll(): Promise<Employee[]> {
    return apiClient.get<Employee[]>('/employees');
  },

  /**
   * Delete an employee by ID and type
   */
  async delete(id: string, type: 'VALET' | 'ATTENDANT'): Promise<void> {
    return apiClient.delete(`/employees/${id}?type=${type}`);
  },
};
