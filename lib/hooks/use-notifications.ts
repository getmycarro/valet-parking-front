"use client";

// Re-export from context so there is a single polling interval per provider tree.
export { useNotificationsContext as useNotifications } from "@/lib/context/notifications-context";
