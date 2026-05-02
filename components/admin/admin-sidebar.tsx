"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Car,
  LayoutDashboard,
  Users,
  CreditCard,
  Building2,
  FileText,
  Wallet,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, type UserRole } from "@/lib/auth";

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  userRole: UserRole;
  onLogout: () => void;
}

type MenuItem = {
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
  roles: UserRole[];
  badge?: string;
};

type MenuGroup = {
  label: string;
  items: MenuItem[];
};

const menuGroups: MenuGroup[] = [
  {
    label: "Gestión",
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        href: "/admin/dashboard",
        roles: ["admin", "manager"],
      },
      {
        icon: Building2,
        label: "Compañías",
        href: "/admin/companies",
        roles: ["super_admin"],
      },
      {
        icon: Users,
        label: "Usuarios",
        href: "/admin/users",
        roles: ["super_admin"],
      },
      {
        icon: Users,
        label: "Empleados",
        href: "/admin/employees",
        roles: ["admin"],
      },
      {
        icon: CreditCard,
        label: "Cobros",
        href: "/admin/billing",
        roles: ["admin", "manager"],
      },
      {
        icon: FileText,
        label: "Facturas",
        href: "/admin/invoices",
        roles: ["admin", "manager"],
      },
      {
        icon: Wallet,
        label: "Métodos de pago",
        href: "/admin/payment-methods",
        roles: ["admin"],
      },
    ],
  },
  {
    label: "Análisis",
    items: [
      {
        icon: BarChart2,
        label: "Reportes",
        href: "/admin/reports",
        roles: ["admin", "super_admin"],
      },
      {
        icon: Settings,
        label: "Configuración",
        href: "/admin/settings",
        roles: ["admin", "super_admin"],
      },
    ],
  },
];

const roleLabels: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Administrador",
  manager: "Gerente",
  attendant: "Valet",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

export function AdminSidebar({ isOpen, onToggle, userRole, onLogout }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const visibleGroups = menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(userRole)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        id="admin-sidebar"
        aria-label="Navegación principal"
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-800 shrink-0">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white leading-none block">
                ParkAdmin
              </span>
              <span className="text-xs text-slate-500 mt-0.5 block">Panel de Control</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto scrollbar-hide">
          {visibleGroups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 1024) onToggle();
                      }}
                      className={cn(
                        "admin-sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                        isActive
                          ? "active bg-slate-800/80 text-white"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/50",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "w-5 h-5 shrink-0",
                          isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300",
                        )}
                      />
                      <span className="text-sm font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User profile */}
        <div className="p-4 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer transition-colors group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
              {user?.name ? getInitials(user.name) : "AD"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name ?? "Admin"}
              </p>
              <p className="text-xs text-slate-500">{roleLabels[userRole]}</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              aria-label="Cerrar sesión"
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
