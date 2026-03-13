"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Eye,
} from "lucide-react";
import { useStore } from "@/lib/store";
import type { PaymentRecord } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useVehicles } from "@/lib/hooks/use-vehicles";
import type {
  ParkingRecord,
  ValetInfo,
} from "@/lib/services/vehicles-service";
import { vehiclesService } from "@/lib/services/vehicles-service";
import { paymentsService } from "@/lib/services/payments-service";

function formatTime(ts: string | number) {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function formatDateTime(ts: string | number) {
  const d = new Date(ts);
  return d.toLocaleString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type TicketStatus = "red" | "yellow" | "green";

function getTicketStatus(record: ParkingRecord): TicketStatus {
  if (record.checkOutAt) return "green";
  const hasPayment = record.payments && record.payments.length > 0;
  if (hasPayment) return "yellow";
  return "red";
}

const ticketStatusConfig = {
  red: { color: "bg-red-500", label: "Sin pago" },
  yellow: { color: "bg-yellow-500", label: "Pagado - pendiente entrega" },
  green: { color: "bg-green-500", label: "Entregado" },
} as const;

type StatusFilter = "todos" | "activos" | "pendientes" | "pagados";

type Props = {
  query?: string;
  onQueryChange?: (q: string) => void;
  showSearch?: boolean;
  refreshKey?: number;
  companyId?: string | null;
  hideResultsCard?: boolean;
};

export function VehiclesDashboardView({
  query = "",
  onQueryChange,
  showSearch = false,
  refreshKey = 0,
  companyId = null,
  hideResultsCard = false,
}: Props) {
  const { state, deliverCar, addPayment } = useStore();

  const {
    data: vehicles,
    meta,
    isLoading,
    filters,
    setFilters,
    setPage,
    refresh,
    clearFilters,
  } = useVehicles({ page: 1, limit: 20, status: "active" });

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("activos");

  // Advanced filter dialog state
  const [filterOpen, setFilterOpen] = useState(false);
  const [ftPlaca, setFtPlaca] = useState("");
  const [ftMarca, setFtMarca] = useState("");
  const [ftModelo, setFtModelo] = useState("");
  const [ftDateFrom, setFtDateFrom] = useState("");
  const [ftDateTo, setFtDateTo] = useState("");

  // Manual payment modal state
  const [payOpen, setPayOpen] = useState(false);
  const [payCarId, setPayCarId] = useState<string | null>(null);
  const [payMonto, setPayMonto] = useState<string>("");
  const [payMethodId, setPayMethodId] = useState<string>("");
  const [payReferencia, setPayReferencia] = useState<string>("");
  const [payNota, setPayNota] = useState<string>("");

  // Valet list state
  const [valets, setValets] = useState<ValetInfo[]>([]);
  useEffect(() => {
    vehiclesService.getValets().then(setValets).catch(() => {});
  }, []);

  // Payment methods fetched directly from the API (company-scoped if companyId is available)
  const [paymentMethods, setPaymentMethods] = useState<
    { id: string; name: string; form: string; type: string; isActive: boolean }[]
  >([]);
  useEffect(() => {
    if (companyId) {
      paymentsService.getCompanyMethods(companyId).then(setPaymentMethods).catch(() => {});
    } else {
      paymentsService.getMethods().then(setPaymentMethods).catch(() => {});
    }
  }, [companyId]);

  // Checkout dialog state (assign valet de salida)
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutCarId, setCheckoutCarId] = useState<string | null>(null);
  const [checkoutValetId, setCheckoutValetId] = useState("");
  const [checkoutNotes, setCheckoutNotes] = useState("");

  // Detail modal state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<ParkingRecord | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Refresh when parent signals (e.g., after vehicle registration)
  useEffect(() => {
    if (refreshKey > 0) refresh();
  }, [refreshKey, refresh]);

  // Sync search query from parent to server-side filter
  useEffect(() => {
    setFilters({ search: query || undefined });
  }, [query, setFilters]);

  // Sync company filter from parent
  useEffect(() => {
    setFilters({ companyId: companyId || undefined });
  }, [companyId, setFilters]);

  // 📊 FLUJO DE DATOS DE CONTADORES:
  // 1. Cuando cambia companyId (o cualquier filtro), se ejecuta setFilters()
  // 2. Esto dispara el useEffect en use-vehicles.ts que llama fetchVehicles()
  // 3. El API calcula los contadores (active, pending_delivery, completed) para los filtros aplicados
  // 4. Se retornan en response.meta (líneas ~36-39 en use-vehicles.ts)
  // 5. setMeta() actualiza el estado, lo que causa un re-render aquí
  // 6. Los contadores (activosCount, pendientesEntregaCount, entregadosCount) se actualizan automáticamente
  // 7. Los contadores son EXACTOS y reflejan EL TOTAL con los filtros aplicados, NO solo la página actual

  // Contadores estáticos obtenidos directamente del API (meta)
  // No se calculan filtrando, sino que vienen precalculados del backend
  // Se actualizan automáticamente cuando cambian los filtros (companyId, status, fechas, etc.)
  const activosCount = meta.active ?? 0;           // Total vehículos SIN PAGO
  const pendientesEntregaCount = meta.pending_delivery ?? 0;  // Total pagados pero SIN ENTREGAR
  const entregadosCount = meta.completed ?? 0;     // Total ENTREGADOS

  const handleStatusFilter = (s: StatusFilter) => {
    setStatusFilter(s);
    const statusMap = {
      todos: "all" as const,
      activos: "active" as const,
      pendientes: "pending_delivery" as const,
      pagados: "completed" as const,
    };
    setFilters({ status: statusMap[s] });
  };

  const handleApplyAdvancedFilters = () => {
    setFilters({
      plate: ftPlaca || undefined,
      brand: ftMarca || undefined,
      model: ftModelo || undefined,
      dateFrom: ftDateFrom || undefined,
      dateTo: ftDateTo || undefined,
    });
    setFilterOpen(false);
  };

  const handleClearAdvancedFilters = () => {
    setFtPlaca("");
    setFtMarca("");
    setFtModelo("");
    setFtDateFrom("");
    setFtDateTo("");
    setFilters({
      plate: undefined,
      brand: undefined,
      model: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
    setFilterOpen(false);
  };

  const handleClearAllFilters = () => {
    setFtPlaca("");
    setFtMarca("");
    setFtModelo("");
    setFtDateFrom("");
    setFtDateTo("");
    setStatusFilter("activos");
    if (onQueryChange) onQueryChange("");
    clearFilters();
  };

  // Check if any non-default filters are active
  const hasActiveFilters =
    statusFilter !== "activos" ||
    filters.plate ||
    filters.brand ||
    filters.model ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.search;

  const getAmount = (car: ParkingRecord): number | null => {
    // Check payments from the API response first
    if (car.payments && car.payments.length > 0) {
      const sorted = [...car.payments].sort((a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return sorted[0].amountUSD;
    }
    // Check local store payments
    const pagos = state.payments
      .filter((p: PaymentRecord) => p.parkingRecordId === car.id)
      .sort((x, y) => y.date - x.date);
    return pagos[0]?.amountUSD ?? null;
  };

  const handleOpenDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const record = await vehiclesService.getById(id);
      setDetailRecord(record);
    } catch {
      setDetailRecord(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleCheckout = async () => {
    if (!checkoutCarId || !checkoutValetId) return;
    try {
      await deliverCar(
        checkoutCarId,
        checkoutValetId,
        checkoutNotes || undefined,
      );
      refresh();
      setCheckoutOpen(false);
      setCheckoutCarId(null);
      setCheckoutValetId("");
      setCheckoutNotes("");
    } catch {
      // error handled by store
    }
  };

  return (
    <div className="space-y-6">
      <div className={`grid gap-4 ${hideResultsCard ? "md:grid-cols-3" : "md:grid-cols-4"}`}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sin pago
            </CardTitle>
            <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {activosCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendientes de entrega
            </CardTitle>
            <span className="inline-block h-3 w-3 rounded-full bg-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {pendientesEntregaCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Entregados
            </CardTitle>
            <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {entregadosCount}
            </div>
          </CardContent>
        </Card>
        {!hideResultsCard && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Resultados
              </CardTitle>
              <Search className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {meta.total}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        {showSearch && (
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por placa o nombre..."
                value={query}
                onChange={(e) => onQueryChange?.(e.target.value)}
                className="pl-9 w-[250px]"
              />
            </div>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Button
            variant={statusFilter === "todos" ? "default" : "outline"}
            onClick={() => handleStatusFilter("todos")}
          >
            Todos
          </Button>
          <Button
            variant={statusFilter === "activos" ? "default" : "outline"}
            onClick={() => handleStatusFilter("activos")}
          >
            Activos
          </Button>
          <Button
            variant={statusFilter === "pendientes" ? "default" : "outline"}
            onClick={() => handleStatusFilter("pendientes")}
          >
            Pendientes
          </Button>
          <Button
            variant={statusFilter === "pagados" ? "default" : "outline"}
            onClick={() => handleStatusFilter("pagados")}
          >
            Pagados
          </Button>
          <Button variant="outline" onClick={() => setFilterOpen(true)}>
            <Filter className="w-4 h-4 mr-2" />
            Filtrar
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAllFilters}
              className="text-muted-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      <Card>
        <div className="relative w-full overflow-auto">
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          <table className="w-full caption-bottom text-sm text-foreground">
            <thead className="[&_tr]:border-b [&_tr]:border-border">
              <tr className="border-b transition-colors hover:bg-accent/30 data-[state=selected]:bg-accent/30">
                <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
                  Estado
                </th>
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
                  Entrada
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Registrado por
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Valet entrada
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Valet salida
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Monto
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                  Accion
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {vehicles.map((a) => {
                const amount = getAmount(a);
                const status = getTicketStatus(a);
                const statusCfg = ticketStatusConfig[status];
                return (
                  <tr
                    key={a.id}
                    className="border-b border-border transition-colors hover:bg-accent/30 odd:bg-muted/20"
                  >
                    <td className="p-4 align-middle text-center">
                      <span
                        className={`inline-block h-3 w-3 rounded-full ${statusCfg.color}`}
                        title={statusCfg.label}
                      />
                    </td>
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
                      {a.registerRecord
                        ? `${a.registerRecord.name} - ${a.registerRecord.idNumber || ""}`
                        : "-"}
                    </td>
                    <td className="p-4 align-middle">
                      {a.checkInValet
                        ? `${a.checkInValet.name} - ${a.checkInValet.idNumber || ""}`
                        : "-"}
                    </td>
                    <td className="p-4 align-middle">
                      {a.checkOutValet
                        ? `${a.checkOutValet.name} - ${a.checkOutValet.idNumber || ""}`
                        : "-"}
                    </td>
                    <td className="p-4 align-middle">
                      {amount !== null ? `$${amount.toFixed(2)}` : "-"}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenDetail(a.id)}
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {status === "red" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setPayCarId(a.id);
                              setPayMonto(amount !== null ? String(amount) : "");
                              setPayMethodId(paymentMethods.find((m) => m.isActive)?.id || "");
                              setPayReferencia("");
                              setPayNota("");
                              setPayOpen(true);
                            }}
                          >
                            Pago
                          </Button>
                        )}
                        {status === "yellow" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setCheckoutCarId(a.id);
                              setCheckoutValetId("");
                              setCheckoutNotes("");
                              setCheckoutOpen(true);
                            }}
                          >
                            Entregar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {vehicles.length === 0 && !isLoading && (
                <tr>
                  <td
                    colSpan={12}
                    className="p-4 text-center text-muted-foreground"
                  >
                    No hay vehiculos encontrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {vehicles.length} de {meta.total} resultados
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => setPage(meta.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Pagina {meta.page} de {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() => setPage(meta.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Checkout dialog (assign valet de salida) */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entregar vehiculo</DialogTitle>
            <DialogDescription>
              Selecciona el valet de salida para entregar el vehiculo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Valet de salida</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={checkoutValetId}
                onChange={(e) => setCheckoutValetId(e.target.value)}
              >
                <option value="">-- Seleccionar valet --</option>
                {valets.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} - {v.idNumber}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Notas</Label>
              <textarea
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                placeholder="Agregar nota sobre la entrega..."
                value={checkoutNotes}
                onChange={(e) => setCheckoutNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCheckoutOpen(false);
                setCheckoutCarId(null);
                setCheckoutNotes("");
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleCheckout} disabled={!checkoutValetId}>Confirmar entrega</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual payment modal */}
      <Modal
        isOpen={payOpen}
        onClose={() => {
          setPayOpen(false);
          setPayCarId(null);
          setPayMonto("");
          setPayMethodId("");
          setPayReferencia("");
          setPayNota("");
        }}
        title="Pago manual"
        description="Registra un pago para el vehiculo seleccionado"
        size="md"
      >
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!payCarId || !payMethodId) return;
            const amt = Number.parseFloat(payMonto);
            if (!Number.isFinite(amt) || amt <= 0) return;
            const selectedMethod = paymentMethods.find(
              (m) => m.id === payMethodId,
            );
            if (!selectedMethod) return;
            try {
              await addPayment({
                parkingRecordId: payCarId,
                paymentMethodId: payMethodId,
                methodId: payMethodId,
                amountUSD: amt,
                tip: 0,
                fee: selectedMethod.form,
                validation: "MANUAL",
                status: "received",
                reference: payReferencia || undefined,
                note: payNota || undefined,
              });
              refresh();
              setPayOpen(false);
              setPayCarId(null);
              setPayMonto("");
              setPayMethodId("");
              setPayReferencia("");
              setPayNota("");
            } catch {
              // error handled by store
            }
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="payMonto">Monto</Label>
              <Input
                id="payMonto"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={payMonto}
                onChange={(e) => setPayMonto(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="payMethodId">Metodo de pago</Label>
              <select
                id="payMethodId"
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={payMethodId}
                onChange={(e) => setPayMethodId(e.target.value)}
              >
                <option value="">-- Seleccionar --</option>
                {paymentMethods
                  .filter((m) => m.isActive)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.form}
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="payRef">Referencia</Label>
              <Input
                id="payRef"
                placeholder="Codigo o referencia"
                value={payReferencia}
                onChange={(e) => setPayReferencia(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="payNota">Nota (opcional)</Label>
              <Input
                id="payNota"
                placeholder="Nota adicional"
                value={payNota}
                onChange={(e) => setPayNota(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => setPayOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!payMethodId}>
              Registrar pago
            </Button>
          </div>
        </form>
      </Modal>

      {/* Advanced filter dialog */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtrar resultados</DialogTitle>
            <DialogDescription>Aplica filtros avanzados</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Placa</label>
              <Input
                placeholder="ABC-123"
                value={ftPlaca}
                onChange={(e) => setFtPlaca(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Marca</label>
              <Input
                placeholder="Toyota"
                value={ftMarca}
                onChange={(e) => setFtMarca(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Modelo</label>
              <Input
                placeholder="Corolla"
                value={ftModelo}
                onChange={(e) => setFtModelo(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">
                Fecha desde
              </label>
              <Input
                type="date"
                value={ftDateFrom}
                onChange={(e) => setFtDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">
                Fecha hasta
              </label>
              <Input
                type="date"
                value={ftDateTo}
                onChange={(e) => setFtDateTo(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClearAdvancedFilters}>
              Limpiar
            </Button>
            <Button onClick={handleApplyAdvancedFilters}>Aplicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vehicle detail modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Detalle del ticket{" "}
              {detailRecord ? `#${detailRecord.id.slice(-7)}` : ""}
            </DialogTitle>
            <DialogDescription>
              Informacion completa del registro de estacionamiento
            </DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : detailRecord ? (
            <div className="space-y-4 text-sm">
              {/* Vehicle info */}
              <div className="p-3 bg-muted/50 rounded-lg border border-border space-y-1">
                <p className="font-medium text-base">
                  {detailRecord.plate}
                </p>
                <p className="text-muted-foreground">
                  {[detailRecord.brand, detailRecord.model, detailRecord.color]
                    .filter(Boolean)
                    .join(" - ") || "Sin detalles del vehiculo"}
                </p>
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground text-xs">Check-in</p>
                  <p className="font-medium">
                    {formatDateTime(detailRecord.checkInAt)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Check-out</p>
                  <p className="font-medium">
                    {detailRecord.checkOutAt
                      ? formatDateTime(detailRecord.checkOutAt)
                      : "Pendiente"}
                  </p>
                </div>
              </div>

              {/* People */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Registrado por
                    </p>
                    <p className="font-medium">
                      {detailRecord.registerRecord
                        ? `${detailRecord.registerRecord.name}`
                        : "-"}
                    </p>
                    {detailRecord.registerRecord?.idNumber && (
                      <p className="text-xs text-muted-foreground">
                        {detailRecord.registerRecord.idNumber}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Valet entrada
                    </p>
                    <p className="font-medium">
                      {detailRecord.checkInValet
                        ? `${detailRecord.checkInValet.name}`
                        : "-"}
                    </p>
                    {detailRecord.checkInValet?.idNumber && (
                      <p className="text-xs text-muted-foreground">
                        {detailRecord.checkInValet.idNumber}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Valet salida</p>
                  <p className="font-medium">
                    {detailRecord.checkOutValet
                      ? `${detailRecord.checkOutValet.name}`
                      : "-"}
                  </p>
                  {detailRecord.checkOutValet?.idNumber && (
                    <p className="text-xs text-muted-foreground">
                      {detailRecord.checkOutValet.idNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Payments */}
              {detailRecord.payments && detailRecord.payments.length > 0 && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Pagos</p>
                  <div className="space-y-2">
                    {detailRecord.payments.map((p: any) => (
                      <div
                        key={p.id}
                        className="p-2 bg-muted/30 rounded border border-border space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">${p.amountUSD?.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground">
                            {p.status}
                          </span>
                        </div>
                        {p.reference && (
                          <p className="text-xs text-muted-foreground">
                            Referencia: {p.reference}
                          </p>
                        )}
                        {p.note && (
                          <p className="text-xs text-muted-foreground">
                            Nota: {p.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center gap-2 pt-2">
                {(() => {
                  const s = getTicketStatus(detailRecord);
                  const cfg = ticketStatusConfig[s];
                  const textColors = {
                    red: "bg-red-100 text-red-800",
                    yellow: "bg-yellow-100 text-yellow-800",
                    green: "bg-green-100 text-green-800",
                  };
                  return (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${textColors[s]}`}
                    >
                      <span className={`inline-block h-2 w-2 rounded-full ${cfg.color}`} />
                      {cfg.label}
                    </span>
                  );
                })()}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No se pudo cargar el detalle
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
