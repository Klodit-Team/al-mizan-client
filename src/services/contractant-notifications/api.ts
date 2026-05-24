import { apiClient } from "@/services/client";

export type ContractantNotificationCategory =
  | "publication"
  | "attribution"
  | "recours"
  | "systeme"
  | "ia";

export interface ContractantNotificationItem {
  id: string;
  title: string;
  content: string;
  category: ContractantNotificationCategory;
  sentAt: string;
  isRead: boolean;
}

export interface ContractantUnreadCount {
  count: number;
}

export async function listContractantNotifications(): Promise<ContractantNotificationItem[]> {
  return apiClient<ContractantNotificationItem[]>(
    "/api/v1/notifications/mes-notifications",
    { method: "GET" },
  );
}

export async function getContractantUnreadCount(): Promise<ContractantUnreadCount> {
  return apiClient<ContractantUnreadCount>(
    "/api/v1/notifications/non-lues/count",
    { method: "GET" },
  );
}

export async function markContractantNotificationAsRead(
  notificationId: string,
): Promise<void> {
  await apiClient<unknown>(
    `/api/v1/notifications/${notificationId}/lire`,
    { method: "PATCH" },
  );
}

export async function markAllContractantNotificationsAsRead(): Promise<void> {
  await apiClient<unknown>(
    "/api/v1/notifications/marquer-toutes-lues",
    { method: "PATCH" },
  );
}
