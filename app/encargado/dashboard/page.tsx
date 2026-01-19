"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Car,
  CheckCircle,
  Clock,
  LayoutDashboard,
  PlusCircle,
  Search,
} from "lucide-react";
import { SidebarLayout } from "@/components/ui/sidebar-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import type { Car as CarType, PaymentRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

function formatTime(ts: number) {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export default function EncargadoDashboardPage() {
  const { state, entregarAuto, calcularMonto } = useStore();
  const { user } = useAuth();
  const pathname = usePathname();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"todos" | "activos" | "pagados">(
    "activos"
  );

  const activos = useMemo(
    () => state.autos.filter((a: CarType) => !a.checkOutAt),
    [state.autos]
  );

  const entregados = useMemo(
    () => state.autos.filter((a: CarType) => !!a.checkOutAt),
    [state.autos]
  );

  const pagados = useMemo(
    () =>
      state.pagos.filter((p: PaymentRecord) => p.estado === "recibido").length,
    [state.pagos]
  );

  const list = useMemo(() => {
    let base = state.autos;
    if (filter === "activos") base = activos;
    if (filter === "pagados") {
      const ids = new Set(
        state.pagos
          .filter((p: PaymentRecord) => p.estado === "recibido")
          .map((p) => p.carId)
      );
      base = state.autos.filter((a: CarType) => ids.has(a.id));
    }
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (a) =>
        (a.placa || "").toLowerCase().includes(q) ||
        (a.nombre || "").toLowerCase().includes(q)
    );
  }, [state.autos, state.pagos, activos, filter, query]);

  const navigation = (
    <>
      <Link
        href="/encargado/dashboard"
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          pathname === "/encargado/dashboard" &&
            "bg-accent text-accent-foreground"
        )}
      >
        <LayoutDashboard className="w-4 h-4" />
        <span>Resumen</span>
      </Link>
      <Link
        href="/encargado/registrar"
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          pathname === "/encargado/registrar" &&
            "bg-accent text-accent-foreground"
        )}
      >
        <PlusCircle className="w-4 h-4" />
        <span>Registrar vehículo</span>
      </Link>
    </>
  );

  return (
    <SidebarLayout
      navigation={navigation}
      userInfo={{
        name: user?.nombre || "Encargado",
        role: "Encargado",
      }}
    >
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Car className="w-5 h-5 text-primary" />
          Panel del Encargado
        </h1>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Activos
              </CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {activos.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pagados
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {pagados}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Entregados
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {entregados.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por placa o nombre..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 w-[250px]"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={filter === "todos" ? "default" : "outline"}
              onClick={() => setFilter("todos")}
            >
              Todos
            </Button>
            <Button
              variant={filter === "activos" ? "default" : "outline"}
              onClick={() => setFilter("activos")}
            >
              Activos
            </Button>
            <Button
              variant={filter === "pagados" ? "default" : "outline"}
              onClick={() => setFilter("pagados")}
            >
              Pagados
            </Button>
            <Link href="/encargado/registrar">
              <Button className="ml-2">Nuevo vehículo</Button>
            </Link>
          </div>
        </div>

        <Card>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-foreground">
              <thead className="[&_tr]:border-b [&_tr]:border-border">
                <tr className="border-b transition-colors hover:bg-accent/30 data-[state=selected]:bg-accent/30">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Ticket
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Placa
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Nombre
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Marca
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Check-in
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Monto
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {list
                  .filter((a: CarType) => !a.checkOutAt)
                  .map((a: CarType) => (
                    <tr
                      key={a.id}
                      className="border-b border-border transition-colors hover:bg-accent/30 odd:bg-muted/20"
                    >
                      <td className="p-4 align-middle font-medium">
                        {a.id.slice(-7)}
                      </td>
                      <td className="p-4 align-middle">{a.placa}</td>
                      <td className="p-4 align-middle">{a.nombre || "-"}</td>
                      <td className="p-4 align-middle">{a.marca || "-"}</td>
                      <td className="p-4 align-middle">
                        {formatTime(a.checkInAt)}
                      </td>
                      <td className="p-4 align-middle">
                        ${calcularMonto(a).toFixed(2)}
                      </td>
                      <td className="p-4 align-middle text-right">
                        <Button size="sm" onClick={() => entregarAuto(a.id)}>
                          Entregar
                        </Button>
                      </td>
                    </tr>
                  ))}
                {list.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-4 text-center text-muted-foreground"
                    >
                      No hay vehículos encontrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </SidebarLayout>
  );
}
