"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SSE_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const MAX_RETRY_DELAY_MS = 30_000;

export interface ClientSSEPayload {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  recipientId: string;
  createdAt: string;
}

export function useClientNotifications(token: string | null) {
  const [notifications, setNotifications] = useState<ClientSSEPayload[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const esRef = useRef<EventSource | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryDelayRef = useRef(1_000);
  const mountedRef = useRef(false);

  const connect = useCallback(() => {
    if (!token || !mountedRef.current) return;

    const url = `${SSE_BASE_URL}/notifications/client-stream?token=${encodeURIComponent(token)}`;
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
          payload?: ClientSSEPayload;
        };
        if (parsed.type === "heartbeat") return;
        if (
          parsed.type === "notification" &&
          parsed.payload?.type === "OBJECT_SEARCH_IN_PROGRESS"
        ) {
          setNotifications((prev) => [parsed.payload!, ...prev]);
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
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!token) return;
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      esRef.current?.close();
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [connect, token]);

  const lastNotification = notifications[0] ?? null;

  return { notifications, lastNotification, isConnected };
}
