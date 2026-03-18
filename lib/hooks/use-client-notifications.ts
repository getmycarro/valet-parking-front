"use client";

// SSE was removed in favour of OneSignal push notifications.
// This hook is kept as a no-op stub so existing imports don't break.

export interface ClientSSEPayload {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  recipientId: string;
  createdAt: string;
}

export function useClientNotifications(_token: string | null) {
  return {
    notifications: [] as ClientSSEPayload[],
    lastNotification: null as ClientSSEPayload | null,
    isConnected: false,
  };
}
