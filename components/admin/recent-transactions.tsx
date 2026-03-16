"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown, Check, X } from "lucide-react";
import { paymentsService, type Payment, type PaymentsListResponse } from "@/lib/services/payments-service";

function formatRelativeTime(ts: string) {
  const diffMs = Date.now() - new Date(ts).getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return "Hace instantes";
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} d`;
}

function mapStatus(status: string): "completado" | "pendiente" | "cancelado" {
  if (status === "RECEIVED") return "completado";
  if (status === "CANCELLED") return "cancelado";
  return "pendiente";
}

type Props = {
  companyId?: string | null;
  onMetaUpdate?: (meta: {
    pending: number;
    cancelled: number;
    completed: number;
    all: number;
    pendingAmountUSD: number;
    cancelledAmountUSD: number;
    completedAmountUSD: number;
  }) => void;
};

export function RecentTransactions({ companyId, onMetaUpdate }: Props) {
  const [response, setResponse] = useState<PaymentsListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'PENDING' | 'RECEIVED' | 'CANCELLED' | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'amountUSD' | 'paymentMethod'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [actionLoading, setActionLoading] = useState<Record<string, 'approving' | 'rejecting'>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSort = (column: 'createdAt' | 'amountUSD' | 'paymentMethod') => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder(column === 'amountUSD' ? 'desc' : 'asc');
    }
    setPage(1);
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortOrder === 'asc'
      ? <ArrowUp className="h-3 w-3 ml-1" />
      : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const data = await paymentsService.getAll({
          page,
          limit: 20,
          companyId: companyId || undefined,
          status: status === 'all' ? undefined : status,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          sortBy,
          sortOrder,
        });
        if (!cancelled) setResponse(data);
      } catch {
        // silently fail – component shows empty state
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [page, status, companyId, dateFrom, dateTo, sortBy, sortOrder, refreshKey]);

  const payments = response?.data ?? [];
  const meta = response?.meta;
  const currentPage = meta?.page ?? 1;
  const totalPages = meta?.totalPages ?? 1;

  // Notify parent of meta when it changes (only on first page and all status)
  useEffect(() => {
    if (meta && onMetaUpdate && page === 1 && status === 'all') {
      onMetaUpdate({
        pending: meta.pending,
        cancelled: meta.cancelled,
        completed: meta.completed,
        all: meta.all,
        pendingAmountUSD: meta.pendingAmountUSD,
        cancelledAmountUSD: meta.cancelledAmountUSD,
        completedAmountUSD: meta.completedAmountUSD,
      });
    }
  }, [meta, onMetaUpdate, page, status]);

  const handleUpdateStatus = async (id: string, action: 'approving' | 'rejecting') => {
    setActionLoading((prev) => ({ ...prev, [id]: action }));
    try {
      await paymentsService.updateStatus(id, {
        status: action === 'approving' ? 'RECEIVED' : 'CANCELLED',
      });
      setRefreshKey((k) => k + 1);
    } catch {
      // silently fail
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Transacciones</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatus('all')}
              className={status === 'all' ? 'border-primary' : ''}
            >
              Todos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatus('PENDING')}
              className={status === 'PENDING' ? 'border-primary' : ''}
            >
              Pendientes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatus('RECEIVED')}
              className={status === 'RECEIVED' ? 'border-primary' : ''}
            >
              Completados
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatus('CANCELLED')}
              className={status === 'CANCELLED' ? 'border-primary' : ''}
            >
              Cancelados
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="w-auto text-sm h-8"
            placeholder="From"
          />
          <span className="text-muted-foreground text-sm">–</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="w-auto text-sm h-8"
            placeholder="To"
          />
          {(dateFrom || dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setDateFrom(''); setDateTo(''); setPage(1); }}
              className="text-xs h-8"
            >
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>ID</TableHead>
              <TableHead>Vehículo</TableHead>
              <TableHead>
                <button onClick={() => handleSort('amountUSD')} className="flex items-center hover:text-foreground transition-colors">
                  Monto <SortIcon column="amountUSD" />
                </button>
              </TableHead>
              <TableHead>
                <button onClick={() => handleSort('paymentMethod')} className="flex items-center hover:text-foreground transition-colors">
                  Método <SortIcon column="paymentMethod" />
                </button>
              </TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Referencia</TableHead>
              <TableHead className="text-right">
                <button onClick={() => handleSort('createdAt')} className="flex items-center ml-auto hover:text-foreground transition-colors">
                  Hora <SortIcon column="createdAt" />
                </button>
              </TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-sm">
                  {p.id.slice(-8)}
                </TableCell>
                <TableCell className="font-medium">
                  {p.parkingRecord?.plate ?? "N/A"}
                </TableCell>
                <TableCell className="font-semibold">
                  ${p.amountUSD.toFixed(2)}
                </TableCell>
                <TableCell>
                  {p.paymentMethod?.name ?? p.paymentMethod?.type ?? "-"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      mapStatus(p.status) === "completado"
                        ? "default"
                        : mapStatus(p.status) === "cancelado"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {mapStatus(p.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[140px] truncate" title={p.reference || p.note || undefined}>
                  {p.reference || p.note || "-"}
                </TableCell>
                <TableCell className="text-right text-muted-foreground text-sm">
                  {formatRelativeTime(p.date)}
                </TableCell>
                <TableCell className="text-right">
                  {p.status === "PENDING" && (
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                        disabled={!!actionLoading[p.id]}
                        onClick={() => handleUpdateStatus(p.id, 'approving')}
                        title="Aprobar pago"
                      >
                        {actionLoading[p.id] === 'approving' ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-destructive border-destructive hover:bg-red-50"
                        disabled={!!actionLoading[p.id]}
                        onClick={() => handleUpdateStatus(p.id, 'rejecting')}
                        title="Rechazar pago"
                      >
                        {actionLoading[p.id] === 'rejecting' ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {payments.length === 0 && !isLoading && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground text-sm py-6"
                >
                  No hay pagos registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
