import { apiClient } from "../api-client";
import type { AppNotification } from "@/lib/types";

const API_BASE_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
  "http://localhost:3001/api";

// ─── Raw API shapes ────────────────────────────────────────────────────────────

interface ApiNotificationCompany {
  id: string;
  name: string;
}

interface ApiNotificationUser {
  id: string;
  name: string;
  email: string;
}

interface ApiNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
  company: ApiNotificationCompany;
  triggeredBy: ApiNotificationUser | null;
  recipient: ApiNotificationUser | null;
}

interface UnreadNotificationsResponse {
  data: ApiNotification[];
  total: number;
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

function mapApiNotification(n: ApiNotification): AppNotification {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    data: n.data ?? {},
    isRead: n.isRead,
    createdAt: n.createdAt,
    company: n.company,
    triggeredBy: n.triggeredBy ?? null,
    recipient: n.recipient ?? null,
  };
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const notificationsService = {
  /**
   * GET /notifications/unread — multi-company, for polling.
   * Uses native fetch to avoid axios envelope-unwrapping stripping `total`.
   */
  async getUnread(
    signal?: AbortSignal
  ): Promise<{ data: AppNotification[]; total: number }> {
    const token = apiClient.getToken();
    const res = await fetch(`${API_BASE_URL}/notifications/unread`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal,
    });

    if (!res.ok) {
      const err = new Error(`Notifications fetch failed: ${res.status}`);
      (err as Error & { status: number }).status = res.status;
      throw err;
    }

    const json: UnreadNotificationsResponse = await res.json();
    const notifications = (json.data ?? []).map(mapApiNotification);
    return { data: notifications, total: json.total ?? notifications.length };
  },

  async markRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`, {});
  },

  async markAllRead(): Promise<void> {
    await apiClient.patch("/notifications/read-all", {});
  },

  async markAllReadAllCompanies(): Promise<{ updated: number }> {
    const res = await apiClient.patch<{ updated: number }>(
      "/notifications/read-all-companies",
      {}
    );
    return res;
  },

  async acceptNotification(id: string): Promise<{ success: boolean }> {
    const res = await apiClient.patch<{ success: boolean }>(
      `/notifications/${id}/accept`,
      {}
    );
    return res;
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
