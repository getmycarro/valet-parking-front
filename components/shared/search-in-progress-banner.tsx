"use client";

import { useEffect, useState } from "react";
import { X, Search } from "lucide-react";
import type { ClientSSEPayload } from "@/lib/hooks/use-client-notifications";

interface Props {
  notification: ClientSSEPayload | null;
  onDismiss: () => void;
}

export function SearchInProgressBanner({ notification, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!notification) return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 10_000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!visible || !notification) return null;

  const notes = notification.data.notes as string | undefined;
  const ts = new Date(notification.createdAt).toLocaleTimeString("es-VE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 p-4 shadow-lg text-sm">
        <Search className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1">
          <p className="font-semibold text-blue-900 dark:text-blue-100">
            {notification.title}
          </p>
          <p className="text-blue-800 dark:text-blue-200">
            {notification.message}
          </p>
          {notes && (
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Nota: {notes}
            </p>
          )}
          <p className="text-xs text-blue-600 dark:text-blue-400">{ts}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setVisible(false);
            onDismiss();
          }}
          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 flex-shrink-0"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
