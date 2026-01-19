"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Car,
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  ParkingCircle,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  // { icon: Car, label: "Vehículos", href: "/admin/vehiculos" },
  { icon: Users, label: "Encargados", href: "/admin/encargados" },
  { icon: CreditCard, label: "Facturación", href: "/admin/facturacion" },
  { icon: ParkingCircle, label: "Espacios", href: "/admin/espacios" },
  // { icon: BarChart3, label: "Reportes", href: "/admin/reportes" },
  { icon: Clock, label: "Historial", href: "/admin/historial" },
  // { icon: Settings, label: "Configuración", href: "/admin/configuracion" },
];

export function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-card border-r border-border z-50 transition-all duration-300",
          isOpen ? "w-64" : "w-20",
          "hidden lg:block",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Car className="w-6 h-6 text-primary-foreground" />
            </div>
            {isOpen && (
              <span className="font-bold text-foreground">Valet Admin</span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Toggle button */}
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border-border shadow-sm"
          onClick={onToggle}
        >
          {isOpen ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>
      </aside>
    </>
  );
}
