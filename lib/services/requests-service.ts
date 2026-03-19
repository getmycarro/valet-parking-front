import { apiClient } from "../api-client";

export type VehicleRequestStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface UpdateRequestStatusBody {
  status: VehicleRequestStatus;
  notes?: string;
}

export const requestsService = {
  async updateStatus(
    id: string,
    data: UpdateRequestStatusBody
  ): Promise<void> {
    await apiClient.patch(`/requests/${id}/status`, data);
  },
};
