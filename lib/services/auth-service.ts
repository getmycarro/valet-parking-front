import { apiClient } from '../api-client';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'ATTENDANT';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    phone?: string;
    idNumber?: string;
    photoUrl?: string;
  };
  accessToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  idNumber?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  idNumber?: string;
  photoUrl?: string;
}

/**
 * Servicio de autenticación
 */
export const authService = {
  /**
   * Login de usuario
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);

    // Guardar el token en el cliente
    if (response.accessToken) {
      apiClient.setToken(response.accessToken);
    }

    return response;
  },

  /**
   * Registro de usuario
   */
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/register', data);

    // Guardar el token en el cliente
    if (response.accessToken) {
      apiClient.setToken(response.accessToken);
    }

    return response;
  },

  /**
   * Obtener perfil del usuario autenticado
   */
  async me(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  },

  /**
   * Logout (limpiar token)
   */
  logout(): void {
    apiClient.clearToken();
  },

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return apiClient.hasToken();
  },
};
