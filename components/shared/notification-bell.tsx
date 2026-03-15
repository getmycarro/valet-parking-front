"use client";

import { Bell, CheckCheck, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/lib/hooks/use-notifications";

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

export function NotificationBell() {
  const { notifications, unreadCount, isConnected, markAsRead, markAllAsRead } =
    useNotifications();

  return (
    <DropdownMenu>
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
                onClick={() => markAsRead(notif.id)}
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
  );
}
