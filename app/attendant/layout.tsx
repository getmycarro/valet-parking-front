"use client";

import { NotificationsProvider } from "@/lib/context/notifications-context";
import type { ReactNode } from "react";

export default function AttendantLayout({ children }: { children: ReactNode }) {
  return <NotificationsProvider>{children}</NotificationsProvider>;
}
