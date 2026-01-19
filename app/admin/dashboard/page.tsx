"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Car,
  DollarSign,
  Users,
  Calendar,
  Download,
  Filter,
  Search,
  Bell,
  LogOut,
  Settings,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  ParkingCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { OccupancyChart } from "@/components/admin/occupancy-chart";
import { RecentTransactions } from "@/components/admin/recent-transactions";
import { ActiveVehicles } from "@/components/admin/active-vehicles";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import type { Car as CarType, PaymentRecord } from "@/lib/types";

type StatTrend = "up" | "down" | "neutral";

type Stat = {
  title: string;
  value: string;
  change: string;
  trend: StatTrend;
  icon: typeof DollarSign;
  description: string;
};

export default function AdminDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { state } = useStore();
  const { user, logout } = useAuth();
  const router = useRouter();

  const stats: Stat[] = useMemo(() => {
    const activeCars = state.autos.filter((a: CarType) => !a.checkOutAt).length;
    const totalRevenue = state.pagos.reduce(
      (acc: number, p: PaymentRecord) => acc + p.montoUSD,
      0
    );
    const activeEmployees = state.empleados.length;
    const maxCapacity = 100;
    const occupancy = Math.min(
      100,
      Math.round((activeCars / maxCapacity) * 100)
    );

    return [
      {
        title: "Ingresos Totales",
        value: `$${totalRevenue.toFixed(2)}`,
        change: "",
        trend: "neutral",
        icon: DollarSign,
        description: "Basado en pagos registrados",
      },
      {
        title: "Vehículos Activos",
        value: String(activeCars),
        change: "",
        trend: "neutral",
        icon: Car,
        description: "En estacionamiento",
      },
      {
        title: "Encargados Registrados",
        value: String(activeEmployees),
        change: "",
        trend: "neutral",
        icon: Users,
        description: "En el sistema",
      },
      {
        title: "Ocupación Estimada",
        value: `${occupancy}%`,
        change: "",
        trend: "neutral",
        icon: ParkingCircle,
        description: `Capacidad base ${maxCapacity} vehículos`,
      },
    ];
  }, [state]);

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
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Bienvenido de vuelta, {user?.nombre || "Administrador"}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  className="pl-10 w-64 bg-background"
                />
              </div>

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
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="bg-card hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      <div className="flex items-center gap-1">
                        {stat.trend === "up" && (
                          <ArrowUpRight className="w-4 h-4 text-green-600" />
                        )}
                        {stat.trend === "down" && (
                          <ArrowDownRight className="w-4 h-4 text-red-500" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            stat.trend === "up"
                              ? "text-green-600"
                              : stat.trend === "down"
                              ? "text-red-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {stat.change}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {stat.description}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Ingresos</CardTitle>
                  <CardDescription>
                    Ingresos de los últimos 7 días
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      Esta Semana
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Hoy</DropdownMenuItem>
                    <DropdownMenuItem>Esta Semana</DropdownMenuItem>
                    <DropdownMenuItem>Este Mes</DropdownMenuItem>
                    <DropdownMenuItem>Este Año</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <RevenueChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ocupación</CardTitle>
                <CardDescription>Distribución por zona</CardDescription>
              </CardHeader>
              <CardContent>
                <OccupancyChart />
              </CardContent>
            </Card>
          </div>

          {/* Tables Section */}
          <Tabs defaultValue="transactions" className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="transactions">Transacciones</TabsTrigger>
                <TabsTrigger value="vehicles">Vehículos Activos</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtrar
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>

            <TabsContent value="transactions" className="mt-0">
              <RecentTransactions />
            </TabsContent>

            <TabsContent value="vehicles" className="mt-0">
              <ActiveVehicles />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
