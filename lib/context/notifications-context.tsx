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
import { notificationsService } from "@/lib/services/notifications-service";
import { useAuth } from "@/lib/auth";
import type { AppNotification } from "@/lib/types";

// ─── Context value ─────────────────────────────────────────────────────────────

interface NotificationsContextValue {
  notifications: AppNotification[];
  total: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markAllAsReadAllCompanies: () => Promise<void>;
  refresh: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null
);

// ─── Toast helpers ────────────────────────────────────────────────────────────

function fireNotificationToast(n: AppNotification) {
  const { type, title, message } = n;

  if (type === "CHECKOUT_REQUEST") {
    toast.info(title, { description: message });
    return;
  }
  if (type === "OBJECT_SEARCH_REQUEST") {
    toast.warning(title, { description: message });
    return;
  }
  if (type === "APPROACH_COUNTER") {
    toast.info(title, { description: message });
    return;
  }
  if (type === "OBJECT_SEARCH_IN_PROGRESS") {
    toast.info(title, { description: message });
    return;
  }
  // Legacy payment types
  if (type === "PAYMENT_REGISTERED") {
    const d = (n.data ?? {}) as { amountUSD?: number; plate?: string };
    toast.info(title, {
      description: d.plate
        ? `Placa: ${d.plate}${d.amountUSD != null ? ` — $${d.amountUSD}` : ""}`
        : message,
    });
    return;
  }
  if (type === "PAYMENT_STATUS_UPDATED") {
    const d = (n.data ?? {}) as { status?: string };
    if (d.status === "RECEIVED") toast.success(title, { description: message });
    else if (d.status === "CANCELLED") toast.error(title, { description: message });
    return;
  }
  if (type === "PAYMENT_EXPIRED") {
    const d = (n.data ?? {}) as { totalAmount?: number };
    toast.warning(title, {
      description:
        d.totalAmount != null ? `Monto: $${d.totalAmount} — ${message}` : message,
      duration: 10_000,
    });
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 15_000;

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Track IDs already shown as toasts to avoid duplicates across poll cycles.
  const seenIdsRef = useRef<Set<string>>(new Set());
  // True until the first successful poll completes (suppress toasts on initial load).
  const isFirstPollRef = useRef(true);
  // Ref to the in-flight AbortController so cleanup can cancel it.
  const abortControllerRef = useRef<AbortController | null>(null);
  // Stable ref to the refresh trigger counter.
  const refreshCountRef = useRef(0);
  const [refreshTick, setRefreshTick] = useState(0);

  const refresh = useCallback(() => {
    refreshCountRef.current += 1;
    setRefreshTick((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!user) return;

    let intervalId: ReturnType<typeof setInterval>;
    let stopped = false;

    async function poll() {
      if (stopped) return;

      // Abort any previous in-flight request.
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        if (isFirstPollRef.current) setLoading(true);

        const result = await notificationsService.getUnread(controller.signal);

        if (stopped) return;

        setNotifications(result.data);
        setTotal(result.total);

        if (isFirstPollRef.current) {
          // Seed seen IDs from initial load — don't fire toasts.
          result.data.forEach((n) => seenIdsRef.current.add(n.id));
          isFirstPollRef.current = false;
          setLoading(false);
        } else {
          // Fire toasts only for genuinely new notifications.
          const newNotifs = result.data.filter(
            (n) => !seenIdsRef.current.has(n.id)
          );
          newNotifs.forEach((n) => {
            seenIdsRef.current.add(n.id);
            fireNotificationToast(n);
          });
        }
      } catch (err: unknown) {
        if (stopped) return;
        // Ignore aborted requests.
        if (err instanceof DOMException && err.name === "AbortError") return;
        // On 401, stop polling — the user session is gone.
        if ((err as { status?: number }).status === 401) {
          stopped = true;
          clearInterval(intervalId);
          return;
        }
        // Silently ignore other transient errors.
        if (isFirstPollRef.current) {
          isFirstPollRef.current = false;
          setLoading(false);
        }
      }
    }

    poll();
    intervalId = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      stopped = true;
      clearInterval(intervalId);
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      // Reset state for next mount (e.g. after logout/login).
      isFirstPollRef.current = true;
      seenIdsRef.current = new Set();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, refreshTick]);

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic: remove immediately from local state.
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setTotal((t) => Math.max(0, t - 1));
    seenIdsRef.current.delete(id);
    try {
      await notificationsService.markRead(id);
    } catch {
      // optimistic update stays; next poll will reconcile.
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications([]);
    setTotal(0);
    seenIdsRef.current.clear();
    notificationsService.markAllRead().catch(() => {});
  }, []);

  const markAllAsReadAllCompanies = useCallback(async () => {
    setNotifications([]);
    setTotal(0);
    seenIdsRef.current.clear();
    notificationsService.markAllReadAllCompanies().catch(() => {});
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        total,
        loading,
        markAsRead,
        markAllAsRead,
        markAllAsReadAllCompanies,
        refresh,
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
