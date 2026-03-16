import { apiClient } from "../api-client";
import type { AppNotification } from "@/lib/types";

export interface ApiNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | string;
  isRead: boolean;
  companyId: string;
  triggeredById?: string;
  createdAt: string;
  updatedAt?: string;
}

export function mapApiNotification(n: ApiNotification): AppNotification {
  let data: Record<string, unknown> = {};
  if (typeof n.data === "string") {
    try {
      data = JSON.parse(n.data);
    } catch {}
  } else if (n.data && typeof n.data === "object") {
    data = n.data;
  }
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    data,
    companyId: n.companyId,
    createdAt: new Date(n.createdAt).getTime(),
    read: n.isRead,
  };
}

export const notificationsService = {
  async getAll(): Promise<AppNotification[]> {
    const results = await apiClient.get<ApiNotification[]>("/notifications");
    return results.map(mapApiNotification);
  },

  async markRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`, {});
  },

  async markAllRead(): Promise<void> {
    await apiClient.patch("/notifications/read-all", {});
  },

  async startObjectSearch(data: {
    parkingRecordId: string;
    notes?: string;
  }): Promise<void> {
    await apiClient.post("/notifications/object-search-in-progress", data);
  },
};
