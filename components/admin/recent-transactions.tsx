"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStore } from "@/lib/store";
import type {
  Car,
  PaymentMethod,
  PaymentRecord,
  PaymentStatus,
} from "@/lib/types";

type TxStatus = "completado" | "pendiente";

type Tx = {
  id: string;
  vehicle: string;
  customer: string;
  amount: string;
  method: string;
  status: TxStatus;
  time: string;
};

function formatRelativeTime(ts: number) {
  const diffMs = Date.now() - ts;
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return "Hace instantes";
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} d`;
}

function mapEstado(estado: PaymentStatus): TxStatus {
  return estado === "received" ? "completado" : "pendiente";
}

export function RecentTransactions() {
  const { state } = useStore();

  const transactions: Tx[] = useMemo(
    () =>
      state.payments
        .slice()
        .sort((a: PaymentRecord, b: PaymentRecord) => b.date - a.date)
        .slice(0, 10)
        .map((p: PaymentRecord) => {
          const car = state.cars.find((a: Car) => a.id === p.parkingRecordId);
          const metodo = state.paymentMethods.find(
            (m: PaymentMethod) => m.id === p.methodId
          );

          return {
            id: p.id.slice(-8),
            vehicle: car?.plate || "N/A",
            customer: car?.plate || "N/A",
            amount: `$${p.amountUSD.toFixed(2)}`,
            method: metodo?.type || "Otro",
            status: mapEstado(p.status),
            time: formatRelativeTime(p.date),
          };
        }),
    [state.payments, state.cars, state.paymentMethods]
  );

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>ID</TableHead>
              <TableHead>Vehículo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Tiempo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="font-mono text-sm">{tx.id}</TableCell>
                <TableCell className="font-medium">{tx.vehicle}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
                        {tx.customer
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{tx.customer}</span>
                  </div>
                </TableCell>
                <TableCell className="font-semibold">{tx.amount}</TableCell>
                <TableCell>{tx.method}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      tx.status === "completado" ? "default" : "secondary"
                    }
                  >
                    {tx.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground text-sm">
                  {tx.time}
                </TableCell>
              </TableRow>
            ))}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground text-sm py-6"
                >
                  Aún no hay pagos registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
