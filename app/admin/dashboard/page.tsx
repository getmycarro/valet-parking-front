"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { VehiclesDashboardView } from "@/components/shared/vehicles-dashboard-view";
import { VehicleRegistrationForm } from "@/components/shared/vehicle-registration-form";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/lib/auth";

export default function AdminDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const router = useRouter();
  const [regOpen, setRegOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Bienvenido de vuelta, {user?.nombre || "Administrador"}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="relative bg-transparent"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/admin-avatar.png" />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        AD
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm font-medium">
                      {user?.nombre || "Admin"}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Configuración
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => {
                      logout();
                      router.push("/");
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div />
            <Button onClick={() => setRegOpen(true)} className="uppercase">
              Registrar vehículo
            </Button>
          </div>
          <VehiclesDashboardView showSearch={false} />
        </div>
        <Modal
          isOpen={regOpen}
          onClose={() => setRegOpen(false)}
          title="Registrar vehículo"
          description="Completa los datos para registrar el vehículo"
          size="lg"
        >
          <VehicleRegistrationForm onSubmitted={() => setRegOpen(false)} />
        </Modal>
      </main>
    </div>
  );
}
