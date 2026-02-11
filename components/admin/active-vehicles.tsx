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
import { formatTime, formatDuration } from "@/lib/utils/time";
import type { Car, PaymentRecord } from "@/lib/types";

type Props = {
  search?: string;
};

export function ActiveVehicles({ search }: Props) {
  const { state, deliverCar } = useStore();

  const vehicles = useMemo(
    () =>
      state.cars
        .filter((a: Car) => !a.checkOutAt)
        .map((a: Car) => {
          const payments = state.payments.filter(
            (p: PaymentRecord) => p.parkingRecordId === a.id
          );
          const hasPending = payments.some(
            (p: PaymentRecord) => p.status === "pending"
          );
          const hasReceived = payments.some(
            (p: PaymentRecord) => p.status === "received"
          );
          const status = hasPending
            ? "pending payment"
            : hasReceived
            ? "paid"
            : "active";

          return {
            id: a.id,
            plate: a.plate,
            brand: [a.brand, a.model].filter(Boolean).join(" ") || "No data",
            zone: "N/A",
            entryTime: formatTime(a.checkInAt),
            duration: formatDuration(a.checkInAt, Date.now()),
            attendant: a.checkInValet?.name || "N/A",
            status,
          };
        }),
    [state.cars, state.payments]
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
              <TableHead>Plate</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Attendant</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                      vehicle.status === "active"
                        ? "default"
                        : vehicle.status === "pending payment"
                        ? "secondary"
                        : "outline"
                    }
                    className={
                      vehicle.status === "pending payment"
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
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>Contact customer</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deliverCar(vehicle.id)}
                      className="hover:bg-secondary"
                    >
                      Move to history
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
