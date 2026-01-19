"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type UserRole = "admin" | "encargado";

export type User = {
  nombre: string;
  rol: UserRole;
};

type AuthCtx = {
  user: User | null;
  login: (nombre: string, rol: UserRole) => void;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

const KEY = "valet_parking_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (user) localStorage.setItem(KEY, JSON.stringify(user));
      else localStorage.removeItem(KEY);
    } catch {}
  }, [user]);

  const api = useMemo<AuthCtx>(
    () => ({
      user,
      login: (nombre: string, rol: UserRole) => setUser({ nombre, rol }),
      logout: () => setUser(null),
    }),
    [user]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("auth");
  return v;
}
