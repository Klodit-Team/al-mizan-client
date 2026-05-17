import { apiClient } from "@/services/client";

export type NotificationCategory =
  | "publication_ao"
  | "depot_confirme"
  | "ouverture_plis"
  | "evaluation_resultat"
  | "attribution_provisoire"
  | "attribution_definitive"
  | "recours_update"
  | "systeme";

export interface Notification {
  id: string;
  category: NotificationCategory;
  title: string;
  description: string;
  time: string;
  read: boolean;
}
const NOTIFICATIONS_BASE_PATH = "/api/v1/notifications";

export async function getAdminNotifications(): Promise<Notification[]> {
  return apiClient<Notification[]>(`${NOTIFICATIONS_BASE_PATH}`, {
    method: "GET",
  });
}

export async function markAdminNotificationRead(id: string): Promise<void> {
  await apiClient<void>(`${NOTIFICATIONS_BASE_PATH}/${id}/lire`, {
    method: "PATCH",
  });
}

export async function markAllAdminNotificationsRead(): Promise<void> {
  await apiClient<void>(`${NOTIFICATIONS_BASE_PATH}/marquer-toutes-lues`, {
    method: "PATCH",
  });
}
