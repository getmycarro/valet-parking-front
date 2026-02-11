"use client";

/**
 * Authentication Context - API Integration
 *
 * Integrates with NestJS backend API for secure authentication using JWT tokens.
 */

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService, type User as ApiUser } from "@/lib/services/auth-service";
import { AuthError, logError } from "@/lib/utils/errors";

// Mapeo de roles de API a roles del frontend
export type UserRole = "admin" | "attendant";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  idNumber?: string;
  photoUrl?: string;
};

type AuthCtx = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const Ctx = createContext<AuthCtx | null>(null);

/**
 * Mapea el rol de la API al rol del frontend
 */
function mapApiRoleToFrontendRole(apiRole: string): UserRole {
  if (apiRole === 'ADMIN') return 'admin';
  if (apiRole === 'ATTENDANT') return 'attendant';
  // Por defecto, asumimos que es attendant si no reconocemos el rol
  return 'attendant';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay un token al montar y obtener datos del usuario
  useEffect(() => {
    async function loadUser() {
      try {
        if (authService.isAuthenticated()) {
          const apiUser = await authService.me();
          setUser({
            id: apiUser.id,
            email: apiUser.email,
            name: apiUser.name,
            role: mapApiRoleToFrontendRole(apiUser.role),
            phone: apiUser.phone,
            idNumber: apiUser.idNumber,
            photoUrl: apiUser.photoUrl,
          });
        }
      } catch (error) {
        logError(error as Error, "AuthProvider.loadUser");
        // Si falla, limpiar el token
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const api = useMemo<AuthCtx>(
    () => ({
      user,
      isLoading,
      login: async (email: string, password: string) => {
        try {
          const response = await authService.login({ email, password });
          setUser({
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            role: mapApiRoleToFrontendRole(response.user.role),
            phone: response.user.phone,
            idNumber: response.user.idNumber,
            photoUrl: response.user.photoUrl,
          });
        } catch (error) {
          logError(error as Error, "AuthProvider.login");
          throw error;
        }
      },
      logout: () => {
        authService.logout();
        setUser(null);
      },
    }),
    [user, isLoading]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new AuthError("useAuth must be used within AuthProvider");
  }
  return ctx;
}
