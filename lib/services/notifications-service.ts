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

interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
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
  async getUnreadCount(): Promise<number> {
    const result = await apiClient.get<{ unreadCount: number }>(
      "/notifications/unread-count"
    );
    return result.unreadCount;
  },

  async getUnreadPage(
    page: number,
    limit = 20
  ): Promise<{ notifications: AppNotification[]; totalPages: number }> {
    const result = await apiClient.get<PaginatedResponse<ApiNotification>>(
      `/notifications?isRead=false&limit=${limit}&page=${page}`
    );
    return {
      notifications: result.data.map(mapApiNotification),
      totalPages: result.meta.totalPages,
    };
  },

  async getAllUnread(): Promise<AppNotification[]> {
    const first = await notificationsService.getUnreadPage(1);
    const all = [...first.notifications];
    for (let page = 2; page <= first.totalPages; page++) {
      const next = await notificationsService.getUnreadPage(page);
      all.push(...next.notifications);
    }
    return all;
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

  async approachCounter(data: {
    parkingRecordId: string;
    notes?: string;
  }): Promise<void> {
    await apiClient.post("/notifications/approach-counter", data);
  },
};
