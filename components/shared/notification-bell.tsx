"use client";

import { useState } from "react";
import { Bell, CheckCheck, WifiOff, CheckCircle2 } from "lucide-react";
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

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "ahora mismo";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days} d`;
}

function fullDate(ts: number): string {
  return new Date(ts).toLocaleString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

// ─── Detail Modal ────────────────────────────────────────────────────────────

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

  if (!notification) return null;

  const dataEntries = Object.entries(notification.data).filter(
    ([k, v]) =>
      !EXCLUDED_DATA_KEYS.has(k) && v !== null && v !== undefined && v !== ""
  );

  // When closing an unread OBJECT_SEARCH_REQUEST, automatically notify the
  // client that the search has started (fire-and-forget, no UI feedback needed).
  function handleClose() {
    if (
      notification!.type === "OBJECT_SEARCH_REQUEST" &&
      !notification!.read
    ) {
      const parkingRecordId = notification!.data.parkingRecordId as
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

  return (
    <Dialog open={!!notification} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
              {formatType(notification.type)}
            </span>
            {notification.read && (
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
          {/* Message */}
          <p className="text-muted-foreground leading-relaxed">
            {notification.message}
          </p>

          {/* Extra data */}
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

          {/* Timestamp */}
          <p className="text-xs text-muted-foreground text-right">
            {fullDate(notification.createdAt)}
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cerrar
          </Button>
          {!notification.read && (
            <Button onClick={handleMarkAsRead} disabled={loading}>
              {loading ? "Marcando…" : "Marcar como leída"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Bell ────────────────────────────────────────────────────────────────────

export function NotificationBell() {
  const { notifications, unreadCount, isConnected, markAsRead, markAllAsRead } =
    useNotifications();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selected, setSelected] = useState<AppNotification | null>(null);

  function openDetail(notif: AppNotification) {
    setDropdownOpen(false);
    setSelected(notif);
  }

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative bg-transparent">
            <Bell className="h-5 w-5" />
            {!isConnected && (
              <WifiOff className="absolute -bottom-1 -right-1 h-3.5 w-3.5 text-destructive bg-background rounded-full p-0.5" />
            )}
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 px-1 text-xs">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80 p-0">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">Notificaciones</p>
              {!isConnected && (
                <span className="flex items-center gap-1 text-xs text-destructive">
                  <WifiOff className="h-3 w-3" />
                  Desconectado
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
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
              {notifications.map((notif) => (
                <button
                  key={notif.id}
                  type="button"
                  onClick={() => openDetail(notif)}
                  className={`w-full text-left px-3 py-3 hover:bg-accent/50 transition-colors ${
                    !notif.read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-0.5 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-sm truncate ${
                            !notif.read ? "font-semibold" : "font-medium"
                          }`}
                        >
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="inline-block h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {relativeTime(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
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
