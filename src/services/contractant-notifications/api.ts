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
  const raw = await apiClient<any>(
    "/api/v1/notifications/mes-notifications",
    { method: "GET" },
  );
  
  let data = raw;
  if (raw && typeof raw === "object") {
    if ("success" in raw && "data" in raw) {
      data = raw.data;
    }
    if (data && typeof data === "object") {
      if ("data" in data && Array.isArray(data.data)) data = data.data;
    }
  }

  return (Array.isArray(data) ? data : []).map((n: any) => ({
    id: n.id,
    title: n.titre || n.title || "Notification",
    content: n.contenu || n.content || "",
    category: (n.categorie || n.category || "SYSTEME").toLowerCase(),
    sentAt: n.dateEnvoi || n.date_envoi || n.createdAt || n.created_at || new Date().toISOString(),
    isRead: n.isLue ?? n.is_lue ?? n.isRead ?? false,
  }));
}

export async function getContractantUnreadCount(): Promise<ContractantUnreadCount> {
  const res = await apiClient<any>(
    "/api/v1/notifications/non-lues/count",
    { method: "GET" },
  );
  if (res && res.data && typeof res.data.count === 'number') {
    return { count: res.data.count };
  }
  return { count: res?.count || 0 };
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
