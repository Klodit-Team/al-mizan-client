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
  const raw = await apiClient<any>(
    "/api/v1/notifications/mes-notifications",
    { method: "GET" },
  );
  
  let data = raw;
  if (raw && typeof raw === "object") {
    if ("data" in raw && Array.isArray(raw.data)) data = raw.data;
    else if ("items" in raw && Array.isArray(raw.items)) data = raw.items;
    else if ("content" in raw && Array.isArray(raw.content)) data = raw.content;
  }
  
  return (Array.isArray(data) ? data : []).map(n => ({
    id: n.id,
    title: n.titre || n.title || "Notification",
    content: n.contenu || n.content || "",
    type: n.type || "PLATEFORME",
    sentAt: n.dateEnvoi || n.date_envoi || n.createdAt || n.created_at || new Date().toISOString(),
    isRead: n.isLue ?? n.is_lue ?? n.isRead ?? false,
  }));
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
