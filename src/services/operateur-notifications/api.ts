import { apiClient } from "@/services/client";

export interface OperateurNotificationItem {
  id: string;
  title: string;
  content: string;
  type: string;
  sentAt: string;
  isRead: boolean;
}

export interface OperateurUnreadCount {
  count: number;
}

export async function listOperateurNotifications(): Promise<OperateurNotificationItem[]> {
  return apiClient<OperateurNotificationItem[]>(
    "/api/v1/notifications/mes-notifications",
    { method: "GET" },
  );
}

export async function getOperateurUnreadCount(): Promise<OperateurUnreadCount> {
  return apiClient<OperateurUnreadCount>(
    "/api/v1/notifications/non-lues/count",
    { method: "GET" },
  );
}

export async function markOperateurNotificationAsRead(notificationId: string): Promise<void> {
  await apiClient<unknown>(
    `/api/v1/notifications/${notificationId}/lire`,
    { method: "PATCH" },
  );
}

export async function markAllOperateurNotificationsAsRead(): Promise<void> {
  await apiClient<unknown>(
    "/api/v1/notifications/marquer-toutes-lues",
    { method: "PATCH" },
  );
}
