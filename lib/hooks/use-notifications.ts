"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const esRef = useRef<EventSource | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryDelayRef = useRef(1_000);
  const mountedRef = useRef(false);

  // Defined with useCallback so the effect dependency is stable
  const connect = useCallback(() => {
    const token = apiClient.getToken();
    if (!token || !mountedRef.current) return;

    const url = `${SSE_BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => {
      if (!mountedRef.current) return;
      setIsConnected(true);
      retryDelayRef.current = 1_000; // reset backoff on successful connection
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
          const notification = mapApiNotification(parsed.payload);
          setNotifications((prev) => [notification, ...prev]);
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mountedRef.current = true;

    // Load existing notifications
    notificationsService.getAll().then(setNotifications).catch(() => {});

    // Open SSE stream
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
    notificationsService.markRead(id).catch(() => {});
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    notificationsService.markAllRead().catch(() => {});
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, isConnected, markAsRead, markAllAsRead };
}
