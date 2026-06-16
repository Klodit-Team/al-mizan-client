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
  page: number;
  limit: number;
  totalPages: number;
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
 * GET /notification-service/v1/notifications/mes-notifications
 * Mes notifications (utilisateur connecté)
 */
export async function listMesNotifications(
  params: ListNotificationsParams = {}
): Promise<PaginatedNotifications> {
  const qs = newSearchParams(params);
  const query = qs.toString() ? `?${qs.toString()}` : "";
  return apiClient<PaginatedNotifications>(`${BASE}/mes-notifications${query}`, { method: "GET" });
}

function newSearchParams(params: any): URLSearchParams {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      qs.set(key, String(value));
    }
  }
  return qs;
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

// ─── Alertes IA ────────────────────────────────────────────────────────────────

export interface AlerteIAEntity {
  id: string;
  incidentId: string;
  utilisateursCibles: string[];
  titre: string;
  message: string;
  niveauUrgence: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  typeAlerte: "DIVERGENCE_GRE_A_GRE" | "DIVERGENCE_EVALUATION" | "CONFIANCE_FAIBLE" | "ERREUR_MODELE" | "ANOMALIE_OFFRES";
  donneesContexte: any;
  statut: "EMISE" | "ACQUITTEE" | "RESOLUE";
  dateCreation: string;
  dateAcquittement?: string;
  acquitteePar?: string;
}

export interface PaginatedAlertesIA {
  data: AlerteIAEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListAlertesIAParams {
  typeAlerte?: string;
  niveauUrgence?: string;
  statut?: string;
  page?: number;
  limit?: number;
}

const ALERTS_BASE = "/notification-service/v1/alertes-ia";

export async function listAlertesIA(params: ListAlertesIAParams = {}): Promise<PaginatedAlertesIA> {
  const qs = newSearchParams(params);
  const query = qs.toString() ? `?${qs.toString()}` : "";
  return apiClient<PaginatedAlertesIA>(`${ALERTS_BASE}${query}`, { method: "GET" });
}

export async function getAlerteIAById(id: string): Promise<AlerteIAEntity> {
  return apiClient<AlerteIAEntity>(`${ALERTS_BASE}/${id}`, { method: "GET" });
}

export async function acquitterAlerteIA(id: string, notesResolution: string): Promise<AlerteIAEntity> {
  return apiClient<AlerteIAEntity>(`${ALERTS_BASE}/${id}/acquitter`, {
    method: "PATCH",
    body: JSON.stringify({ notesResolution }),
  });
}

export async function resoudreAlerteIA(id: string, notesResolution: string): Promise<AlerteIAEntity> {
  return apiClient<AlerteIAEntity>(`${ALERTS_BASE}/${id}/resoudre`, {
    method: "PATCH",
    body: JSON.stringify({ notesResolution }),
  });
}

// ─── Rapports IA ───────────────────────────────────────────────────────────────

export interface RapportIAEntity {
  id: string;
  typeRapport: "QUOTIDIEN" | "HEBDOMADAIRE" | "MENSUEL" | "INCIDENT";
  periodDebut: string;
  periodeFin: string;
  destinataires: string[];
  statistiques: any;
  divergencesCount: number;
  erreursCount: number;
  tauxPrecision: number;
  fichierRapportUrl: string;
  statut: "GENERE" | "ENVOYE";
  createdAt: string;
  sentAt?: string;
}

export interface PaginatedRapportsIA {
  data: RapportIAEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListRapportsIAParams {
  typeRapport?: string;
  statut?: string;
  page?: number;
  limit?: number;
}

const RAPPORTS_BASE = "/notification-service/v1/rapports-ia";

export async function listRapportsIA(params: ListRapportsIAParams = {}): Promise<PaginatedRapportsIA> {
  const qs = newSearchParams(params);
  const query = qs.toString() ? `?${qs.toString()}` : "";
  return apiClient<PaginatedRapportsIA>(`${RAPPORTS_BASE}${query}`, { method: "GET" });
}

export async function getRapportIAById(id: string): Promise<RapportIAEntity> {
  return apiClient<RapportIAEntity>(`${RAPPORTS_BASE}/${id}`, { method: "GET" });
}

export async function genererRapportIA(payload: any): Promise<RapportIAEntity> {
  return apiClient<RapportIAEntity>(RAPPORTS_BASE, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ─── Preferences ───────────────────────────────────────────────────────────────

export interface NotificationPreferences {
  id: string;
  userId: string;
  emailActif: boolean;
  smsActif: boolean;
  pushActif: boolean;
  plateformeActif: boolean;
  optoutCategories: string[];
  createdAt: string;
  updatedAt: string;
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  return apiClient<NotificationPreferences>("/notification-service/v1/preferences", { method: "GET" });
}

export async function updateNotificationPreferences(payload: Partial<NotificationPreferences> & { categoriesDesactivees?: string[] }): Promise<NotificationPreferences> {
  return apiClient<NotificationPreferences>("/notification-service/v1/preferences", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
