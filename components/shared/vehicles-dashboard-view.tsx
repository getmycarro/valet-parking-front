"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle, Clock, Search, Filter } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Car as CarType, PaymentRecord } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
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

type FilterType = "todos" | "activos" | "pagados";

type Props = {
  query?: string;
  onQueryChange?: (q: string) => void;
  showSearch?: boolean;
};

export function VehiclesDashboardView({
  query = "",
  onQueryChange,
  showSearch = false,
}: Props) {
  const { state, calcularMonto } = useStore();
  const [filter, setFilter] = useState<FilterType>("activos");
  const [filterOpen, setFilterOpen] = useState(false);
  const [ftTicket, setFtTicket] = useState("");
  const [ftPlaca, setFtPlaca] = useState("");
  const [ftNombre, setFtNombre] = useState("");
  const [ftMarca, setFtMarca] = useState("");
  const [ftModelo, setFtModelo] = useState("");
  const [ftMetodo, setFtMetodo] = useState("");
  const [ftMontoMin, setFtMontoMin] = useState("");
  const [ftMontoMax, setFtMontoMax] = useState("");
  const [qrOpen, setQrOpen] = useState(false);
  const [qrPlaca, setQrPlaca] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [payCarId, setPayCarId] = useState<string | null>(null);
  const [payMonto, setPayMonto] = useState<string>("");
  const [payMetodo, setPayMetodo] = useState<
    "zelle" | "pago_movil" | "binance"
  >("zelle");
  const [payReferencia, setPayReferencia] = useState<string>("");

  const activos = useMemo(
    () => state.autos.filter((a: CarType) => !a.checkOutAt),
    [state.autos],
  );
  const entregados = useMemo(
    () => state.autos.filter((a: CarType) => !!a.checkOutAt),
    [state.autos],
  );
  const pagados = useMemo(
    () =>
      state.pagos.filter((p: PaymentRecord) => p.estado === "recibido").length,
    [state.pagos],
  );

  const list = useMemo(() => {
    let base = state.autos;
    if (filter === "activos") base = activos;
    if (filter === "pagados") {
      const ids = new Set(
        state.pagos
          .filter((p: PaymentRecord) => p.estado === "recibido")
          .map((p) => p.carId),
      );
      base = state.autos.filter((a: CarType) => ids.has(a.id));
    }
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (a) =>
        (a.placa || "").toLowerCase().includes(q) ||
        (a.nombre || "").toLowerCase().includes(q) ||
        (a.marca || "").toLowerCase().includes(q) ||
        (a.modelo || "").toLowerCase().includes(q) ||
        (a.id || "").toLowerCase().includes(q) ||
        a.id.slice(-7).toLowerCase().includes(q) ||
        (() => {
          const pagos = state.pagos
            .filter((p: PaymentRecord) => p.carId === a.id)
            .sort((x, y) => y.fecha - x.fecha);
          const last = pagos[0];
          const metodo = state.metodosPago.find((m) => m.id === last?.metodoId);
          const metodoTipo = (metodo?.tipo || "").toLowerCase();
          const amount = last ? last.montoUSD : calcularMonto(a);
          const amountStr = amount.toFixed(2).toLowerCase();
          const amountStrDollar = `$${amount.toFixed(2)}`.toLowerCase();
          const timeStr = formatTime(a.checkInAt).toLowerCase();
          return (
            metodoTipo.includes(q) ||
            amountStr.includes(q) ||
            amountStrDollar.includes(q) ||
            timeStr.includes(q)
          );
        })(),
    );
  }, [state.autos, state.pagos, activos, filter, query, calcularMonto]);

  const filtered = useMemo(() => {
    const min = parseFloat(ftMontoMin);
    const max = parseFloat(ftMontoMax);
    const hasMin = !Number.isNaN(min);
    const hasMax = !Number.isNaN(max);
    const method = ftMetodo.trim().toLowerCase();
    const tTicket = ftTicket.trim().toLowerCase();
    const tPlaca = ftPlaca.trim().toLowerCase();
    const tNombre = ftNombre.trim().toLowerCase();
    const tMarca = ftMarca.trim().toLowerCase();
    const tModelo = ftModelo.trim().toLowerCase();

    return list.filter((a) => {
      const ticket = a.id.slice(-7).toLowerCase();
      if (tTicket && !ticket.includes(tTicket)) return false;
      if (tPlaca && !(a.placa || "").toLowerCase().includes(tPlaca))
        return false;
      if (tNombre && !(a.nombre || "").toLowerCase().includes(tNombre))
        return false;
      if (tMarca && !(a.marca || "").toLowerCase().includes(tMarca))
        return false;
      if (tModelo && !(a.modelo || "").toLowerCase().includes(tModelo))
        return false;

      const pagos = state.pagos
        .filter((p: PaymentRecord) => p.carId === a.id)
        .sort((x, y) => y.fecha - x.fecha);
      const last = pagos[0];
      const metodo = state.metodosPago.find((m) => m.id === last?.metodoId);
      const metodoTipo = (metodo?.tipo || "").toLowerCase();
      if (method && metodoTipo !== method) return false;

      const amount = last ? last.montoUSD : calcularMonto(a);
      if (hasMin && amount < min) return false;
      if (hasMax && amount > max) return false;

      return true;
    });
  }, [
    list,
    ftTicket,
    ftPlaca,
    ftNombre,
    ftMarca,
    ftModelo,
    ftMetodo,
    ftMontoMin,
    ftMontoMax,
    state.pagos,
    state.metodosPago,
    calcularMonto,
  ]);

  return (
    <div className="space-y-6">
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
            <div className="text-2xl font-bold text-foreground">{pagados}</div>
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
                  Nombre
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Marca
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
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  QR
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {filtered
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
                      {(() => {
                        const pagos = state.pagos
                          .filter((p: PaymentRecord) => p.carId === a.id)
                          .sort((x, y) => y.fecha - x.fecha);
                        const last = pagos[0];
                        const metodo = state.metodosPago.find(
                          (m) => m.id === last?.metodoId,
                        );
                        return metodo?.tipo || "-";
                      })()}
                    </td>
                    <td className="p-4 align-middle">
                      {(() => {
                        const pagos = state.pagos
                          .filter((p: PaymentRecord) => p.carId === a.id)
                          .sort((x, y) => y.fecha - x.fecha);
                        const last = pagos[0];
                        const amount = last ? last.montoUSD : calcularMonto(a);
                        return `$${amount.toFixed(2)}`;
                      })()}
                    </td>
                    <td className="p-4 align-middle">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (!a.placa) return;
                          setQrPlaca(a.placa);
                          const size = 300;
                          const modules = 29;
                          const c = document.createElement("canvas");
                          c.width = size;
                          c.height = size;
                          const ctx = c.getContext(
                            "2d",
                          ) as CanvasRenderingContext2D;
                          if (ctx) {
                            ctx.fillStyle = "#ffffff";
                            ctx.fillRect(0, 0, size, size);
                            const s = Math.floor(size / modules);
                            function drawFinder(
                              ctx2: CanvasRenderingContext2D,
                              x: number,
                              y: number,
                            ) {
                              ctx2.fillStyle = "#000000";
                              ctx2.fillRect(x * s, y * s, 7 * s, 7 * s);
                              ctx2.fillStyle = "#ffffff";
                              ctx2.fillRect(
                                (x + 1) * s,
                                (y + 1) * s,
                                5 * s,
                                5 * s,
                              );
                              ctx2.fillStyle = "#000000";
                              ctx2.fillRect(
                                (x + 2) * s,
                                (y + 2) * s,
                                3 * s,
                                3 * s,
                              );
                            }
                            drawFinder(ctx, 0, 0);
                            drawFinder(ctx, modules - 7, 0);
                            drawFinder(ctx, 0, modules - 7);
                            let h = 2166136261;
                            const str = a.placa;
                            for (let i = 0; i < str.length; i++) {
                              h ^= str.charCodeAt(i);
                              h +=
                                (h << 1) +
                                (h << 4) +
                                (h << 7) +
                                (h << 8) +
                                (h << 24);
                            }
                            for (let y = 0; y < modules; y++) {
                              for (let x = 0; x < modules; x++) {
                                const inFinder =
                                  (x < 7 && y < 7) ||
                                  (x >= modules - 7 && y < 7) ||
                                  (x < 7 && y >= modules - 7);
                                if (inFinder) continue;
                                const v =
                                  ((x + 1) * 73856093) ^
                                  ((y + 1) * 19349663) ^
                                  h;
                                const on = (v & 7) === 0;
                                if (on) {
                                  ctx.fillStyle = "#000000";
                                  ctx.fillRect(x * s, y * s, s, s);
                                }
                              }
                            }
                            setQrDataUrl(c.toDataURL("image/png"));
                          }
                          setQrOpen(true);
                        }}
                      >
                        Generar QR
                      </Button>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPayCarId(a.id);
                          setPayMonto(String(calcularMonto(a)));
                          setPayMetodo("zelle");
                          setPayReferencia("");
                          setPayOpen(true);
                        }}
                      >
                        Pago manual
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

      <Modal
        isOpen={qrOpen}
        onClose={() => {
          setQrOpen(false);
          setQrPlaca(null);
          setQrDataUrl(null);
        }}
        title="Código QR"
        description={qrPlaca ? `Placa: ${qrPlaca}` : undefined}
        size="md"
      >
        <div className="flex flex-col items-center gap-4">
          {qrPlaca && qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt={`QR de ${qrPlaca}`}
              className="w-64 h-64 border border-border rounded-md bg-white"
            />
          ) : (
            <div className="w-64 h-64 border border-border rounded-md bg-muted" />
          )}
          <Button
            onClick={() => {
              if (!qrDataUrl) return;
              const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Imprimir QR</title>
    <style>
      body { display:flex; align-items:center; justify-content:center; height:100vh; margin:0; }
      img { width:300px; height:300px; }
    </style>
  </head>
  <body>
    <img src="${qrDataUrl}" />
    <script>window.onload = () => { window.print(); };</script>
  </body>
</html>`;
              const w = window.open("", "_blank", "noopener,noreferrer");
              if (w) {
                w.document.open();
                w.document.write(html);
                w.document.close();
              }
            }}
          >
            Imprimir QR
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={payOpen}
        onClose={() => {
          setPayOpen(false);
          setPayCarId(null);
          setPayMonto("");
          setPayMetodo("zelle");
          setPayReferencia("");
        }}
        title="Pago manual"
        description="Registra un pago para el vehículo seleccionado"
        size="md"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!payCarId) return;
            const amount = Number.parseFloat(payMonto);
            if (!Number.isFinite(amount) || amount <= 0) return;
            const metodoExistente = state.metodosPago.find(
              (m) => m.tipo === payMetodo,
            );
            const proceed = (metodoId: string) => {
              // referencia no se persiste en el mock; se podría guardar en detalles del método
              const propina = false;
              const estado: "recibido" = "recibido";
              // addPago requiere estado PaymentStatus
              // @ts-expect-error narrow
              state && calcularMonto && null;
              // usamos la API del store
              const { addPago } = useStore();
              // addPago está disponible vía hook, pero ya en este scope lo tenemos como parte del closure
            };
            // fallback: si no existe el método, lo creamos y luego registramos el pago
            if (!metodoExistente) {
              const { addMetodoPago, addPago } = useStore();
              addMetodoPago({
                tipo: payMetodo,
                validacion: "manual",
                nombre: payMetodo.toUpperCase(),
                detalles: payReferencia
                  ? { referencia: payReferencia }
                  : undefined,
              });
              setTimeout(() => {
                const m = state.metodosPago.find((mm) => mm.tipo === payMetodo);
                if (!m) return;
                addPago({
                  carId: payCarId,
                  metodoId: m.id,
                  montoUSD: amount,
                  propina: false,
                  estado: "recibido",
                });
                setPayOpen(false);
              }, 0);
            } else {
              const { addPago } = useStore();
              addPago({
                carId: payCarId,
                metodoId: metodoExistente.id,
                montoUSD: amount,
                propina: false,
                estado: "recibido",
              });
              setPayOpen(false);
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
              <Label htmlFor="payMetodo">Método de pago</Label>
              <select
                id="payMetodo"
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={payMetodo}
                onChange={(e) =>
                  setPayMetodo(
                    e.target.value as "zelle" | "pago_movil" | "binance",
                  )
                }
              >
                <option value="zelle">Zelle</option>
                <option value="pago_movil">Pago Movil</option>
                <option value="binance">Binance</option>
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="payRef">Referencia</Label>
              <Input
                id="payRef"
                placeholder="Código o nota"
                value={payReferencia}
                onChange={(e) => setPayReferencia(e.target.value)}
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
            <Button type="submit">Registrar pago</Button>
          </div>
        </form>
      </Modal>

      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtrar resultados</DialogTitle>
            <DialogDescription>Aplica filtros por columnas</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Ticket</label>
              <Input
                placeholder="ABC1234"
                value={ftTicket}
                onChange={(e) => setFtTicket(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Placa</label>
              <Input
                placeholder="ABC-123"
                value={ftPlaca}
                onChange={(e) => setFtPlaca(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Nombre</label>
              <Input
                placeholder="Cliente"
                value={ftNombre}
                onChange={(e) => setFtNombre(e.target.value)}
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
                Método de pago
              </label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={ftMetodo}
                onChange={(e) => setFtMetodo(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="zelle">Zelle</option>
                <option value="pago movil">Pago Movil</option>
                <option value="binance">Binance</option>
                <option value="efectivo">Efectivo</option>
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
