"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store";
import type { Car, PaymentRecord } from "@/lib/types";

function formatTime(ts: number) {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function formatDuration(from: number, to: number) {
  const diffMs = Math.max(0, to - from);
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

type Props = {
  search?: string;
};

export function ActiveVehicles({ search }: Props) {
  const { state, entregarAuto } = useStore();

  const vehicles = useMemo(
    () =>
      state.autos
        .filter((a: Car) => !a.checkOutAt)
        .map((a: Car) => {
          const pagos = state.pagos.filter(
            (p: PaymentRecord) => p.carId === a.id
          );
          const tienePendiente = pagos.some(
            (p: PaymentRecord) => p.estado === "pendiente"
          );
          const tieneRecibido = pagos.some(
            (p: PaymentRecord) => p.estado === "recibido"
          );
          const status = tienePendiente
            ? "por cobrar"
            : tieneRecibido
            ? "pagado"
            : "activo";

          return {
            id: a.id,
            plate: a.placa,
            brand: [a.marca, a.modelo].filter(Boolean).join(" ") || "Sin datos",
            zone: "N/A",
            entryTime: formatTime(a.checkInAt),
            duration: formatDuration(a.checkInAt, Date.now()),
            attendant: "N/D",
            status,
          };
        }),
    [state.autos, state.pagos]
  );

  const filtered =
    (search && search.trim()) ?
      vehicles.filter((v) => {
        const q = search.toLowerCase();
        return (
          (v.plate || "").toLowerCase().includes(q) ||
          (v.brand || "").toLowerCase().includes(q) ||
          (v.status || "").toLowerCase().includes(q) ||
          (v.zone || "").toLowerCase().includes(q)
        );
      }) :
      vehicles;

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Placa</TableHead>
              <TableHead>Vehículo</TableHead>
              <TableHead>Zona</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Encargado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-mono font-semibold">
                  {vehicle.plate}
                </TableCell>
                <TableCell>{vehicle.brand}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono">
                    {vehicle.zone}
                  </Badge>
                </TableCell>
                <TableCell>{vehicle.entryTime}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{vehicle.duration}</span>
                  </div>
                </TableCell>
                <TableCell>{vehicle.attendant}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      vehicle.status === "activo"
                        ? "default"
                        : vehicle.status === "por cobrar"
                        ? "secondary"
                        : "outline"
                    }
                    className={
                      vehicle.status === "por cobrar"
                        ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                        : ""
                    }
                  >
                    {vehicle.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                        <DropdownMenuItem>Contactar cliente</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => entregarAuto(vehicle.id)}
                      className="hover:bg-secondary"
                    >
                      Almacenar en historial
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
