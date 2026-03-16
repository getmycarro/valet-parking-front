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
import { apiClient } from "@/lib/api-client";
import {
  notificationsService,
  mapApiNotification,
  type ApiNotification,
} from "@/lib/services/notifications-service";
import type { AppNotification } from "@/lib/types";

const SSE_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const MAX_RETRY_DELAY_MS = 30_000;

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  isConnected: boolean;
  /** Most recent notification delivered via SSE (not from initial load). */
  lastSSENotification: AppNotification | null;
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
  const [isConnected, setIsConnected] = useState(false);
  const [lastSSENotification, setLastSSENotification] =
    useState<AppNotification | null>(null);

  const esRef = useRef<EventSource | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryDelayRef = useRef(1_000);
  const mountedRef = useRef(false);

  const handleSSENotification = useCallback((notification: AppNotification) => {
    setNotifications((prev) => [notification, ...prev]);
    setLastSSENotification(notification);
    firePaymentToast(notification);
  }, []);

  const connect = useCallback(() => {
    const token = apiClient.getToken();
    if (!token || !mountedRef.current) return;

    const url = `${SSE_BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => {
      if (!mountedRef.current) return;
      setIsConnected(true);
      retryDelayRef.current = 1_000;
    };

    es.onmessage = (event) => {
      if (!mountedRef.current) return;
      try {
        const parsed = JSON.parse(event.data) as {
          type: string;
          payload?: ApiNotification;
        };
        if (parsed.type === "heartbeat") return;
        if (parsed.type === "notification" && parsed.payload) {
          handleSSENotification(mapApiNotification(parsed.payload));
        }
      } catch {
        // ignore malformed events
      }
    };

    es.onerror = () => {
      if (!mountedRef.current) return;
      setIsConnected(false);
      es.close();
      esRef.current = null;
      const delay = retryDelayRef.current;
      retryDelayRef.current = Math.min(delay * 2, MAX_RETRY_DELAY_MS);
      retryTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) connect();
      }, delay);
    };
  }, [handleSSENotification]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mountedRef.current = true;

    notificationsService.getAll().then(setNotifications).catch(() => {});
    connect();

    return () => {
      mountedRef.current = false;
      esRef.current?.close();
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [connect]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await notificationsService.markRead(id);
    } catch {
      // optimistic update already applied
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    notificationsService.markAllRead().catch(() => {});
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        lastSSENotification,
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
