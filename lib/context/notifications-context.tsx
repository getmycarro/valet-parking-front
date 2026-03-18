"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  notificationsService,
} from "@/lib/services/notifications-service";
import type { AppNotification } from "@/lib/types";

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null
);

// ─── Toast helpers ────────────────────────────────────────────────────────────

function firePaymentToast(notification: AppNotification) {
  const { type, title, message, data } = notification;

  if (type === "PAYMENT_REGISTERED") {
    const d = data as { amountUSD?: number; plate?: string };
    toast.info(title, {
      description:
        d.plate
          ? `Placa: ${d.plate}${d.amountUSD != null ? ` — $${d.amountUSD}` : ""}`
          : message,
    });
    return;
  }

  if (type === "PAYMENT_STATUS_UPDATED") {
    const d = data as { status?: string };
    if (d.status === "RECEIVED") {
      toast.success(title, { description: message });
    } else if (d.status === "CANCELLED") {
      toast.error(title, { description: message });
    }
    return;
  }

  if (type === "PAYMENT_EXPIRED") {
    const d = data as { totalAmount?: number };
    toast.warning(title, {
      description:
        d.totalAmount != null ? `Monto: $${d.totalAmount} — ${message}` : message,
      duration: 10_000,
    });
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const mountedRef = useRef(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastUnreadCountRef = useRef<number | null>(null);

  const loadUnreadNotifications = useCallback(async () => {
    try {
      const count = await notificationsService.getUnreadCount();
      if (!mountedRef.current) return;
      lastUnreadCountRef.current = count;
      if (count > 0) {
        const unread = await notificationsService.getAllUnread();
        if (!mountedRef.current) return;
        setNotifications(unread);
      } else {
        setNotifications([]);
      }
    } catch {
      // silently ignore initial load errors
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    loadUnreadNotifications();

    pollIntervalRef.current = setInterval(async () => {
      if (!mountedRef.current) return;
      try {
        const count = await notificationsService.getUnreadCount();
        if (!mountedRef.current) return;
        if (count !== lastUnreadCountRef.current) {
          lastUnreadCountRef.current = count;
          if (count > 0) {
            const unread = await notificationsService.getAllUnread();
            if (mountedRef.current) {
              setNotifications(unread);
              // fire toasts for newly arrived unread notifications
              unread
                .filter((n) => !n.read)
                .forEach(firePaymentToast);
            }
          } else {
            setNotifications([]);
          }
        }
      } catch {
        // silently ignore poll errors
      }
    }, 30_000);

    return () => {
      mountedRef.current = false;
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [loadUnreadNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      lastUnreadCountRef.current = next.filter((n) => !n.read).length;
      return next;
    });
    try {
      await notificationsService.markRead(id);
    } catch {
      // optimistic update already applied
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => {
      lastUnreadCountRef.current = 0;
      return prev.map((n) => ({ ...n, read: true }));
    });
    notificationsService.markAllRead().catch(() => {});
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotificationsContext(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error(
      "useNotificationsContext must be used within a NotificationsProvider"
    );
  }
  return ctx;
}
