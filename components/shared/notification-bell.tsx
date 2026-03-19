"use client";

import { useState } from "react";
import { Bell, CheckCheck, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { notificationsService } from "@/lib/services/notifications-service";
import type { AppNotification } from "@/lib/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(createdAt: string): string {
  try {
    return formatDistanceToNow(new Date(createdAt), {
      addSuffix: true,
      locale: es,
    });
  } catch {
    return "";
  }
}

function fullDate(createdAt: string): string {
  try {
    return new Date(createdAt).toLocaleString("es-VE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return createdAt;
  }
}

function formatType(type: string): string {
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const EXCLUDED_DATA_KEYS = new Set(["requestId", "parkingRecordId"]);

const DATA_KEY_LABELS: Record<string, string> = {
  brand: "Marca",
  color: "Color",
  model: "Modelo",
  notes: "Notas",
  plate: "Placa",
  objectDescription: "Descripción del objeto",
  amount: "Monto",
  employeeId: "Empleado",
  employeeName: "Nombre del empleado",
  carId: "Vehículo",
  checkInAt: "Entrada",
  checkOutAt: "Salida",
  ownerName: "Propietario",
  ownerPhone: "Teléfono",
};

function formatDataKey(key: string): string {
  return DATA_KEY_LABELS[key] ?? key.replace(/([A-Z])/g, " $1").trim();
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

const ACCEPTABLE_TYPES = new Set(["CHECKOUT_REQUEST", "OBJECT_SEARCH_REQUEST"]);

interface NotificationDetailProps {
  notification: AppNotification | null;
  onClose: () => void;
  onMarkAsRead: (id: string) => Promise<void>;
}

function NotificationDetail({
  notification,
  onClose,
  onMarkAsRead,
}: NotificationDetailProps) {
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);

  if (!notification) return null;

  const dataEntries = Object.entries(notification.data ?? {}).filter(
    ([k, v]) =>
      !EXCLUDED_DATA_KEYS.has(k) && v !== null && v !== undefined && v !== ""
  );

  const canAccept =
    ACCEPTABLE_TYPES.has(notification.type) && !notification.isRead;

  function handleClose() {
    if (
      notification!.type === "OBJECT_SEARCH_REQUEST" &&
      !notification!.isRead
    ) {
      const parkingRecordId = (notification!.data ?? {}).parkingRecordId as
        | string
        | undefined;
      if (parkingRecordId) {
        notificationsService
          .startObjectSearch({ parkingRecordId })
          .catch(() => {});
      }
    }
    onClose();
  }

  async function handleMarkAsRead() {
    setLoading(true);
    try {
      await onMarkAsRead(notification!.id);
      handleClose();
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept() {
    setAccepting(true);
    try {
      await notificationsService.acceptNotification(notification!.id);
      await onMarkAsRead(notification!.id);
      onClose();
    } finally {
      setAccepting(false);
    }
  }

  return (
    <Dialog open={!!notification} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
              {formatType(notification.type)}
            </span>
            <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-xs font-medium">
              {notification.company.name}
            </span>
            {notification.isRead && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Leída
              </span>
            )}
          </div>
          <DialogTitle className="text-base leading-snug">
            {notification.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground leading-relaxed">
            {notification.message}
          </p>

          {dataEntries.length > 0 && (
            <div className="rounded-lg border border-border bg-muted/40 divide-y divide-border">
              {dataEntries.map(([key, value]) => (
                <div key={key} className="flex gap-3 px-3 py-2">
                  <span className="text-muted-foreground capitalize min-w-28 flex-shrink-0">
                    {formatDataKey(key)}
                  </span>
                  <span className="font-medium break-all">
                    {typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground text-right">
            {fullDate(notification.createdAt)}
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading || accepting}>
            Cerrar
          </Button>
          {!notification.isRead && !canAccept && (
            <Button onClick={handleMarkAsRead} disabled={loading}>
              {loading ? "Marcando…" : "Marcar como leída"}
            </Button>
          )}
          {canAccept && (
            <Button onClick={handleAccept} disabled={accepting}>
              {accepting ? "Aceptando…" : "Aceptar"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Bell ─────────────────────────────────────────────────────────────────────

export function NotificationBell() {
  const { notifications, total, markAsRead, markAllAsReadAllCompanies } =
    useNotifications();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selected, setSelected] = useState<AppNotification | null>(null);

  function openDetail(notif: AppNotification) {
    setDropdownOpen(false);
    setSelected(notif);
  }

  // Group by company name.
  const grouped: Record<string, AppNotification[]> = {};
  for (const n of notifications) {
    const key = n.company?.name ?? "—";
    (grouped[key] ??= []).push(n);
  }
  const companyNames = Object.keys(grouped);
  const isMultiCompany = companyNames.length > 1;

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative bg-transparent">
            <Bell className="h-5 w-5" />
            {total > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 px-1 text-xs">
                {total > 99 ? "99+" : total}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80 p-0">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <p className="text-sm font-semibold">Notificaciones</p>
            {total > 0 && (
              <button
                type="button"
                onClick={markAllAsReadAllCompanies}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Marcar todas
              </button>
            )}
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Sin notificaciones
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-border">
              {companyNames.map((companyName) => (
                <div key={companyName}>
                  {/* Company heading — only visible when multiple companies */}
                  {isMultiCompany && (
                    <div className="px-3 py-1.5 bg-muted/60 sticky top-0">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {companyName}
                      </span>
                    </div>
                  )}

                  {grouped[companyName].map((notif) => (
                    <button
                      key={notif.id}
                      type="button"
                      onClick={() => openDetail(notif)}
                      className={`w-full text-left px-3 py-3 hover:bg-accent/50 transition-colors ${
                        !notif.isRead ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-0.5 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={`text-sm truncate ${
                                !notif.isRead ? "font-semibold" : "font-medium"
                              }`}
                            >
                              {notif.title}
                            </p>
                            {!notif.isRead && (
                              <span className="inline-block h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-2">
                            {/* Company chip — only in single-company mode (multi-company has section headers) */}
                            {!isMultiCompany && (
                              <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground px-1.5 py-0.5 text-[10px] font-medium">
                                {notif.company?.name}
                              </span>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {relativeTime(notif.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <NotificationDetail
        notification={selected}
        onClose={() => setSelected(null)}
        onMarkAsRead={markAsRead}
      />
    </>
  );
}
