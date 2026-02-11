"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle, Search, Filter } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Car as CarType, PaymentRecord } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

function formatTime(ts: number) {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

type Props = {
  query?: string;
  onQueryChange?: (q: string) => void;
  showSearch?: boolean;
};

export function VehiclesHistoryView({
  query = "",
  onQueryChange,
  showSearch = false,
}: Props) {
  const { state, calculateAmount } = useStore();
  const [filterOpen, setFilterOpen] = useState(false);
  const [ftTicket, setFtTicket] = useState("");
  const [ftPlaca, setFtPlaca] = useState("");
  const [ftMarca, setFtMarca] = useState("");
  const [ftModelo, setFtModelo] = useState("");
  const [ftMetodo, setFtMetodo] = useState("");
  const [ftMontoMin, setFtMontoMin] = useState("");
  const [ftMontoMax, setFtMontoMax] = useState("");
  const [ftDesde, setFtDesde] = useState("");
  const [ftHasta, setFtHasta] = useState("");

  const entregados = useMemo(
    () => state.cars.filter((a: CarType) => !!a.checkOutAt),
    [state.cars],
  );

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = entregados;
    if (!q) return base;
    return base.filter((a) => {
      const pagos = state.payments
        .filter((p: PaymentRecord) => p.parkingRecordId === a.id)
        .sort((x, y) => y.date - x.date);
      const last = pagos[0];
      const metodo = state.paymentMethods.find((m) => m.id === last?.methodId);
      const metodoTipo = (metodo?.type || "").toLowerCase();
      const amount = last ? last.amountUSD : calculateAmount(a);
      const amountStr = amount.toFixed(2).toLowerCase();
      const amountStrDollar = `$${amount.toFixed(2)}`.toLowerCase();
      return (
        (a.plate || "").toLowerCase().includes(q) ||
        (a.brand || "").toLowerCase().includes(q) ||
        (a.model || "").toLowerCase().includes(q) ||
        (a.id || "").toLowerCase().includes(q) ||
        a.id.slice(-7).toLowerCase().includes(q) ||
        metodoTipo.includes(q) ||
        amountStr.includes(q) ||
        amountStrDollar.includes(q) ||
        formatTime(a.checkInAt).toLowerCase().includes(q)
      );
    });
  }, [entregados, state.payments, state.paymentMethods, query, calculateAmount]);

  const filtered = useMemo(() => {
    const min = Number.parseFloat(ftMontoMin);
    const max = Number.parseFloat(ftMontoMax);
    const hasMin = !Number.isNaN(min);
    const hasMax = !Number.isNaN(max);
    const method = ftMetodo.trim().toLowerCase();
    const tTicket = ftTicket.trim().toLowerCase();
    const tPlaca = ftPlaca.trim().toLowerCase();
    const tMarca = ftMarca.trim().toLowerCase();
    const tModelo = ftModelo.trim().toLowerCase();
    const fromTs = ftDesde ? Date.parse(ftDesde) : undefined;
    const toTs = ftHasta
      ? Date.parse(ftHasta) + 24 * 60 * 60 * 1000 - 1
      : undefined;

    return list.filter((a) => {
      const ticket = a.id.slice(-7).toLowerCase();
      if (tTicket && !ticket.includes(tTicket)) return false;
      if (tPlaca && !(a.plate || "").toLowerCase().includes(tPlaca))
        return false;
      if (tMarca && !(a.brand || "").toLowerCase().includes(tMarca))
        return false;
      if (tModelo && !(a.model || "").toLowerCase().includes(tModelo))
        return false;
      if (fromTs !== undefined && (a.checkOutAt || 0) < fromTs) return false;
      if (toTs !== undefined && (a.checkOutAt || 0) > toTs) return false;
      const pagos = state.payments
        .filter((p: PaymentRecord) => p.parkingRecordId === a.id)
        .sort((x, y) => y.date - x.date);
      const last = pagos[0];
      const metodo = state.paymentMethods.find((m) => m.id === last?.methodId);
      const metodoTipo = (metodo?.type || "").toLowerCase();
      if (method && metodoTipo !== method) return false;
      const amount = last ? last.amountUSD : calculateAmount(a);
      if (hasMin && amount < min) return false;
      if (hasMax && amount > max) return false;
      return true;
    });
  }, [
    list,
    ftTicket,
    ftPlaca,
    ftMarca,
    ftModelo,
    ftMetodo,
    ftMontoMin,
    ftMontoMax,
    ftDesde,
    ftHasta,
    state.payments,
    state.paymentMethods,
    calculateAmount,
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
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
        {showSearch && (
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cualquier columna..."
                value={query}
                onChange={(e) => onQueryChange?.(e.target.value)}
                className="pl-9 w-[250px]"
              />
            </div>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setFilterOpen(true)}>
            <Filter className="w-4 h-4 mr-2" />
            Filtrar
          </Button>
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
                  Marca
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Modelo
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Color
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Check-in
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Método de pago
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Monto
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {filtered.map((a: CarType) => (
                <tr
                  key={a.id}
                  className="border-b border-border transition-colors hover:bg-accent/30 odd:bg-muted/20"
                >
                  <td className="p-4 align-middle font-medium">
                    {a.id.slice(-7)}
                  </td>
                  <td className="p-4 align-middle">{a.plate}</td>
                  <td className="p-4 align-middle">{a.brand || "-"}</td>
                  <td className="p-4 align-middle">{a.model || "-"}</td>
                  <td className="p-4 align-middle">{a.color || "-"}</td>
                  <td className="p-4 align-middle">
                    {formatTime(a.checkInAt)}
                  </td>
                  <td className="p-4 align-middle">
                    {(() => {
                      const pagos = state.payments
                        .filter((p: PaymentRecord) => p.parkingRecordId === a.id)
                        .sort((x, y) => y.date - x.date);
                      const last = pagos[0];
                      const metodo = state.paymentMethods.find(
                        (m) => m.id === last?.methodId,
                      );
                      return metodo?.type || "-";
                    })()}
                  </td>
                  <td className="p-4 align-middle">
                    {(() => {
                      const pagos = state.payments
                        .filter((p: PaymentRecord) => p.parkingRecordId === a.id)
                        .sort((x, y) => y.date - x.date);
                      const last = pagos[0];
                      const amount = last ? last.amountUSD : calculateAmount(a);
                      return `$${amount.toFixed(2)}`;
                    })()}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="p-4 text-center text-muted-foreground"
                  >
                    No hay vehículos en historial
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtrar historial</DialogTitle>
            <DialogDescription>Aplica filtros por columnas</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label
                htmlFor="fTicket"
                className="text-sm text-muted-foreground"
              >
                Ticket
              </label>
              <Input
                id="fTicket"
                placeholder="ABC1234"
                value={ftTicket}
                onChange={(e) => setFtTicket(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="fPlaca" className="text-sm text-muted-foreground">
                Placa
              </label>
              <Input
                id="fPlaca"
                placeholder="ABC-123"
                value={ftPlaca}
                onChange={(e) => setFtPlaca(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="fMarca" className="text-sm text-muted-foreground">
                Marca
              </label>
              <Input
                id="fMarca"
                placeholder="Toyota"
                value={ftMarca}
                onChange={(e) => setFtMarca(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="fModelo"
                className="text-sm text-muted-foreground"
              >
                Modelo
              </label>
              <Input
                id="fModelo"
                placeholder="Corolla"
                value={ftModelo}
                onChange={(e) => setFtModelo(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="fDesde" className="text-sm text-muted-foreground">
                Fecha desde
              </label>
              <Input
                id="fDesde"
                type="date"
                value={ftDesde}
                onChange={(e) => setFtDesde(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="fHasta" className="text-sm text-muted-foreground">
                Fecha hasta
              </label>
              <Input
                id="fHasta"
                type="date"
                value={ftHasta}
                onChange={(e) => setFtHasta(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">
                Método de pago
              </label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={ftMetodo}
                onChange={(e) => setFtMetodo(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="zelle">Zelle</option>
                <option value="mobile_payment">Pago Movil</option>
                <option value="binance">Binance</option>
                <option value="cash">Efectivo</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">
                Monto mínimo
              </label>
              <Input
                placeholder="0"
                value={ftMontoMin}
                onChange={(e) => setFtMontoMin(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">
                Monto máximo
              </label>
              <Input
                placeholder="100"
                value={ftMontoMax}
                onChange={(e) => setFtMontoMax(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFilterOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setFilterOpen(false)}>Aplicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
