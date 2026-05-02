"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  ArrowLeft,
  Loader2,
  Car,
  Clock,
  Users,
  CreditCard,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { SidebarLayout } from "@/components/ui/sidebar-layout";
import { useAuth } from "@/lib/auth";
import { vehiclesService, type ParkingRecord } from "@/lib/services/vehicles-service";
import { toast } from "sonner";

// ─── helpers ────────────────────────────────────────────────────────────────

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

type TicketStatus = "red" | "yellow" | "green" | "blue";

const statusMap: Record<string, TicketStatus> = {
  UNPAID: "red",
  PAID: "yellow",
  FREE: "green",
  PAYMENT_UNDER_REVIEW: "blue",
};

const statusConfig: Record<
  TicketStatus,
  { dot: string; bg: string; text: string; border: string; label: string }
> = {
  red: {
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-950",
    text: "text-red-800 dark:text-red-200",
    border: "border-red-200 dark:border-red-800",
    label: "Sin pago",
  },
  yellow: {
    dot: "bg-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-950",
    text: "text-yellow-800 dark:text-yellow-200",
    border: "border-yellow-200 dark:border-yellow-800",
    label: "Pagado — pendiente de entrega",
  },
  green: {
    dot: "bg-green-500",
    bg: "bg-green-50 dark:bg-green-950",
    text: "text-green-800 dark:text-green-200",
    border: "border-green-200 dark:border-green-800",
    label: "Entregado",
  },
  blue: {
    dot: "bg-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950",
    text: "text-blue-800 dark:text-blue-200",
    border: "border-blue-200 dark:border-blue-800",
    label: "Pago en revisión",
  },
};

const payStatusConfig: Record<
  string,
  { bg: string; text: string; border: string; label: string }
> = {
  PENDING:   { bg: "bg-yellow-50 dark:bg-yellow-950", text: "text-yellow-700 dark:text-yellow-300", border: "border-yellow-200 dark:border-yellow-800", label: "Pendiente" },
  pending:   { bg: "bg-yellow-50 dark:bg-yellow-950", text: "text-yellow-700 dark:text-yellow-300", border: "border-yellow-200 dark:border-yellow-800", label: "Pendiente" },
  RECEIVED:  { bg: "bg-green-50 dark:bg-green-950",   text: "text-green-700 dark:text-green-300",   border: "border-green-200 dark:border-green-800",   label: "Recibido" },
  received:  { bg: "bg-green-50 dark:bg-green-950",   text: "text-green-700 dark:text-green-300",   border: "border-green-200 dark:border-green-800",   label: "Recibido" },
  CANCELLED: { bg: "bg-red-50 dark:bg-red-950",       text: "text-red-700 dark:text-red-300",       border: "border-red-200 dark:border-red-800",       label: "Cancelado" },
  cancelled: { bg: "bg-red-50 dark:bg-red-950",       text: "text-red-700 dark:text-red-300",       border: "border-red-200 dark:border-red-800",       label: "Cancelado" },
};

// ─── inner content (shared between layouts) ──────────────────────────────────

function ParkingRecordDetail({
  record,
  onUnderReview,
  underReviewLoading,
}: {
  record: ParkingRecord;
  onUnderReview: () => void;
  underReviewLoading: boolean;
}) {
  const ticketStatus = statusMap[record.status] ?? "red";
  const cfg = statusConfig[ticketStatus];

  return (
    <div className="space-y-6">
      {/* Status badge */}
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
      >
        <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </div>

      {/* Vehicle */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Car className="w-4 h-4 text-muted-foreground" />
            Vehículo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Placa</p>
              <p className="font-semibold text-base">{record.plate}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Marca</p>
              <p className="font-medium">{record.brand || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Modelo</p>
              <p className="font-medium">{record.model || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Color</p>
              <p className="font-medium">{record.color || "-"}</p>
            </div>
          </div>
          {record.notes && (
            <p className="mt-4 text-sm text-muted-foreground italic border-t border-border pt-3">
              Notas: {record.notes}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Times */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Tiempos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Check-in</p>
              <p className="font-medium">{formatDateTime(record.checkInAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Check-out</p>
              <p className="font-medium">
                {record.checkOutAt ? formatDateTime(record.checkOutAt) : "Pendiente"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personnel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            Personal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-muted/30 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Registrado por</p>
              <p className="font-medium">
                {record.registerRecord ? record.registerRecord.name : "-"}
              </p>
              {record.registerRecord?.idNumber && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {record.registerRecord.idNumber}
                </p>
              )}
            </div>
            <div className="p-3 bg-muted/30 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Valet entrada</p>
              <p className="font-medium">
                {record.checkInValet ? record.checkInValet.name : "-"}
              </p>
              {record.checkInValet?.idNumber && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {record.checkInValet.idNumber}
                </p>
              )}
            </div>
            <div className="p-3 bg-muted/30 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Valet salida</p>
              <p className="font-medium">
                {record.checkOutValet ? record.checkOutValet.name : "-"}
              </p>
              {record.checkOutValet?.idNumber && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {record.checkOutValet.idNumber}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            Pagos
            {record.payments && record.payments.length > 0 && (
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                ({record.payments.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {record.payments && record.payments.length > 0 ? (
            <div className="space-y-3">
              {record.payments.map((p: any) => {
                const ps = payStatusConfig[p.status] ?? {
                  bg: "bg-muted/30",
                  text: "text-muted-foreground",
                  border: "border-border",
                  label: p.status,
                };
                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-lg border border-border bg-muted/20 space-y-3"
                  >
                    {/* Amount row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold">
                          ${p.amountUSD?.toFixed(2)}
                        </span>
                        {p.tip > 0 && (
                          <span className="text-sm text-muted-foreground">
                            + ${p.tip?.toFixed(2)} propina
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${ps.bg} ${ps.text} ${ps.border}`}
                      >
                        {ps.label}
                      </span>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                      {p.paymentMethod && (
                        <div>
                          <p className="text-xs text-muted-foreground">Método</p>
                          <p className="font-medium">
                            {p.paymentMethod.name}
                            {p.paymentMethod.form && (
                              <span className="text-muted-foreground font-normal">
                                {" "}— {p.paymentMethod.form}
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                      {p.validation && (
                        <div>
                          <p className="text-xs text-muted-foreground">Validación</p>
                          <p className="font-medium">
                            {p.validation === "MANUAL" || p.validation === "manual"
                              ? "Manual"
                              : "Automática"}
                          </p>
                        </div>
                      )}
                      {p.reference && (
                        <div>
                          <p className="text-xs text-muted-foreground">Referencia</p>
                          <p className="font-medium font-mono">{p.reference}</p>
                        </div>
                      )}
                      {p.date && (
                        <div>
                          <p className="text-xs text-muted-foreground">Fecha</p>
                          <p className="font-medium">{formatDateTime(p.date)}</p>
                        </div>
                      )}
                      {p.processedBy && (
                        <div>
                          <p className="text-xs text-muted-foreground">Procesado por</p>
                          <p className="font-medium">{p.processedBy.name}</p>
                        </div>
                      )}
                    </div>

                    {p.note && (
                      <p className="text-xs text-muted-foreground italic border-t border-border pt-2">
                        Nota: {p.note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Sin pagos registrados
            </p>
          )}
        </CardContent>
      </Card>

      {/* Raw data (ticket id / createdAt) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            Metadatos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1">ID del ticket</p>
              <p className="font-mono text-xs">{record.id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Creado</p>
              <p className="font-medium">{formatDateTime(record.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Última actualización</p>
              <p className="font-medium">{formatDateTime(record.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action */}
      {record.status !== "FREE" && record.status !== "PAYMENT_UNDER_REVIEW" && (
        <div className="flex justify-end">
          <Button
            disabled={underReviewLoading}
            onClick={onUnderReview}
          >
            {underReviewLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Marcar como Pago en revisión
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function ParkingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;

  const [record, setRecord] = useState<ParkingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [underReviewLoading, setUnderReviewLoading] = useState(false);

  const backUrl =
    user?.role === "attendant" ? "/attendant/dashboard" : "/admin/dashboard";

  const fetchRecord = useCallback(async () => {
    setLoading(true);
    try {
      const data = await vehiclesService.getById(id);
      setRecord(data);
    } catch {
      toast.error("No se pudo cargar el registro");
      router.push(backUrl);
    } finally {
      setLoading(false);
    }
  }, [id, router, backUrl]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  const handleUnderReview = async () => {
    if (!record) return;
    setUnderReviewLoading(true);
    try {
      const updated = await vehiclesService.updateStatus(record.id, "PAYMENT_UNDER_REVIEW");
      setRecord(updated);
      toast.success("Estado actualizado a Pago en revisión");
    } catch {
      toast.error("Error al actualizar el estado");
    } finally {
      setUnderReviewLoading(false);
    }
  };

  const title = record ? `Ticket #${record.id.slice(-7)}` : "Cargando...";
  const subtitle = record ? record.plate : undefined;

  const backButton = (
    <Button variant="outline" onClick={() => router.push(backUrl)}>
      <ArrowLeft className="w-4 h-4 mr-2" />
      Volver
    </Button>
  );

  const body = loading ? (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ) : record ? (
    <ParkingRecordDetail
      record={record}
      onUnderReview={handleUnderReview}
      underReviewLoading={underReviewLoading}
    />
  ) : null;

  if (user?.role === "attendant") {
    return (
      <SidebarLayout
        navigation={null}
        userInfo={{ name: user.name || "Attendant", role: "Attendant" }}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {backButton}
          </div>
          {body}
        </div>
      </SidebarLayout>
    );
  }

  return (
    <AdminLayout title={title} subtitle={subtitle} actions={backButton}>
      {body}
    </AdminLayout>
  );
}
