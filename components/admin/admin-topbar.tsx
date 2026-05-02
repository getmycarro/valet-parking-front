"use client";

import dynamic from "next/dynamic";
import { Menu, Sun, Moon } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { useThemeToggle } from "@/hooks/use-theme-toggle";

const NotificationBell = dynamic(
  () =>
    import("@/components/shared/notification-bell").then((m) => ({
      default: m.NotificationBell,
    })),
  { ssr: false, loading: () => <div className="w-9 h-9 shrink-0" /> },
);

interface AdminTopbarProps {
  title: string;
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
}

export function AdminTopbar({ title, sidebarOpen, onSidebarToggle }: AdminTopbarProps) {
  const { mounted, isDark, toggle } = useThemeToggle();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Ir al contenido principal
      </a>

      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label={sidebarOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
              aria-expanded={sidebarOpen}
              aria-controls="admin-sidebar"
              onClick={onSidebarToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>

            <AdminBreadcrumb title={title} />
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />

            <button
              type="button"
              onClick={toggle}
              aria-label={
                !mounted
                  ? "Cambiar tema"
                  : isDark
                    ? "Cambiar a modo claro"
                    : "Cambiar a modo oscuro"
              }
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              {!mounted ? (
                <div className="w-5 h-5 rounded bg-slate-700 animate-pulse" aria-hidden="true" />
              ) : isDark ? (
                <Sun className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Moon className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
