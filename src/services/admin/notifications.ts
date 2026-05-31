import { apiClient } from "@/services/client";

// ─── Enums ────────────────────────────────────────────────────────────────────

export type NotificationType = "EMAIL" | "SMS" | "PUSH" | "PLATEFORME";

export type NotificationCategorie =
  | "PUBLICATION"
  | "DEPOT"
  | "OUVERTURE"
  | "EVALUATION"
  | "ATTRIBUTION"
  | "RECOURS"
  | "SYSTEME"
  | "IA_DIVERGENCE"
  | "IA_ERREUR";

export type NotificationStatut = "EN_ATTENTE" | "ENVOYE" | "ECHEC" | "LU";

// ─── Entity ────────────────────────────────────────────────────────────────────

/** Matches the backend NotificationEntity exactly */
export interface NotificationEntity {
  id: string;
  userId: string;
  titre: string;
  contenu: string;
  type: NotificationType;
  categorie: NotificationCategorie;
  statut: NotificationStatut;
  isLue: boolean;
  dateEnvoi: string;       // ISO 8601
  dateLecture: string;     // ISO 8601
  destinataire: string;
  messageId: string;
  tentatives: number;
  erreurDetails: string;
  refEntiteId: string;
  refEntiteType: string;
  createdAt: string;       // ISO 8601
}

/** Paginated list response */
export interface PaginatedNotifications {
  data: NotificationEntity[];
  total: number;
}

/** Query params for GET /notification-service/v1/notifications */
export interface ListNotificationsParams {
  userId?: string;
  type?: NotificationType;
  categorie?: NotificationCategorie;
  statut?: NotificationStatut;
  isLue?: boolean;
  page?: number;   // default: 1
  limit?: number;  // default: 20
}

const BASE = "/notification-service/v1/notifications";

// ─── Endpoints ─────────────────────────────────────────────────────────────────

/**
 * GET /notification-service/v1/notifications
 * List all notifications (admin). Roles: ADMIN, CONTROLEUR.
 */
export async function listNotifications(
  params: ListNotificationsParams = {}
): Promise<PaginatedNotifications> {
  const qs = new URLSearchParams();
  if (params.userId)                qs.set("userId", params.userId);
  if (params.type)                  qs.set("type", params.type);
  if (params.categorie)             qs.set("categorie", params.categorie);
  if (params.statut)                qs.set("statut", params.statut);
  if (params.isLue !== undefined)   qs.set("isLue", String(params.isLue));
  if (params.page  !== undefined)   qs.set("page", String(params.page));
  if (params.limit !== undefined)   qs.set("limit", String(params.limit));

  const query = qs.toString() ? `?${qs.toString()}` : "";
  return apiClient<PaginatedNotifications>(`${BASE}${query}`, { method: "GET" });
}

/**
 * GET /notification-service/v1/notifications/{id}
 * Get a single notification by UUID.
 */
export async function getNotificationById(id: string): Promise<NotificationEntity> {
  return apiClient<NotificationEntity>(`${BASE}/${id}`, { method: "GET" });
}

/**
 * PATCH /notification-service/v1/notifications/{id}/lire
 * Mark a single notification as read. Returns the updated notification.
 */
export async function markNotificationRead(id: string): Promise<NotificationEntity> {
  return apiClient<NotificationEntity>(`${BASE}/${id}/lire`, { method: "PATCH" });
}

/**
 * PATCH /notification-service/v1/notifications/marquer-toutes-lues
 * Mark all notifications as read for the current user.
 * Returns { count: number }.
 */
export async function markAllNotificationsRead(): Promise<{ count: number }> {
  return apiClient<{ count: number }>(`${BASE}/marquer-toutes-lues`, { method: "PATCH" });
}

/**
 * GET /notification-service/v1/notifications/non-lues/count
 * Count unread notifications for the current user.
 * Returns { count: number }.
 */
export async function getUnreadNotificationsCount(): Promise<{ count: number }> {
  return apiClient<{ count: number }>(`${BASE}/non-lues/count`, { method: "GET" });
}
