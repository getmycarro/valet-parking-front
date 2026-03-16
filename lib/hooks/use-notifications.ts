"use client";

// Re-export from context so there is a single SSE connection per AdminLayout tree.
export { useNotificationsContext as useNotifications } from "@/lib/context/notifications-context";
