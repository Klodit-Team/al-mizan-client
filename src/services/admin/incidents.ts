import { apiClient } from "@/services/client";

// ─── Enums ────────────────────────────────────────────────────────────────────

export type IncidentType =
  | "DIVERGENCE_GRE_A_GRE"
  | "DIVERGENCE_EVALUATION"
  | "ERREUR_IA"
  | "CONFIANCE_FAIBLE";

export type IncidentStatut = "OUVERT" | "EN_ANALYSE" | "RESOLU" | "IGNORE";

export type IncidentGravite = "FAIBLE" | "MOYENNE" | "ELEVEE" | "CRITIQUE";

// ─── Entity ───────────────────────────────────────────────────────────────────

/** Matches the backend Incident entity exactly */
export interface AIIncident {
  id: string;
  type_incident: IncidentType;
  entite_source: string;
  entite_id: string;
  modele_ia: string;
  decision_ia: string;
  decision_humaine: string;
  ecart_score: number;
  confiance_ia: number;
  gravite: IncidentGravite;
  statut: IncidentStatut;
  assignee_id?: string;
  resolution_notes?: string;
  date_detection: string; // ISO 8601
  date_resolution?: string; // ISO 8601
  created_at: string; // ISO 8601
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

/** Body for POST /incidents */
export interface CreateIncidentDto {
  type_incident: IncidentType;
  entite_source: string;
  entite_id: string;
  modele_ia: string;
  decision_ia: string;
  decision_humaine: string;
  ecart_score: number;
  confiance_ia: number;
  gravite: IncidentGravite;
  date_detection: string;
}

/** Body for PATCH /incidents/{id}/resolve */
export interface ResolveIncidentDto {
  resolution_notes: string;
}

/** Body for PATCH /incidents/{id}/statut */
export interface UpdateIncidentStatutDto {
  statut: IncidentStatut;
}

// ─── Query params ─────────────────────────────────────────────────────────────

export interface ListIncidentsParams {
  type_incident?: IncidentType;
  statut?: IncidentStatut;
  gravite?: IncidentGravite;
  entite_source?: string;
  dateMin?: string;
  dateMax?: string;
  page?: number;
  limit?: number;
}

// ─── Base path ────────────────────────────────────────────────────────────────

const BASE = "/api/v1/incidents";

// ─── Endpoints ────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/incidents
 * List AI incidents with optional filters.
 */
export async function getAdminIncidents(
  params: ListIncidentsParams = {}
): Promise<AIIncident[]> {
  const qs = new URLSearchParams();
  if (params.type_incident) qs.set("type_incident", params.type_incident);
  if (params.statut)        qs.set("statut",        params.statut);
  if (params.gravite)       qs.set("gravite",        params.gravite);
  if (params.entite_source) qs.set("entite_source", params.entite_source);
  if (params.dateMin)       qs.set("dateMin",        params.dateMin);
  if (params.dateMax)       qs.set("dateMax",        params.dateMax);
  if (params.page  !== undefined) qs.set("page",  String(params.page));
  if (params.limit !== undefined) qs.set("limit", String(params.limit));

  const query = qs.toString() ? `?${qs.toString()}` : "";
  return apiClient<AIIncident[]>(`${BASE}${query}`, { method: "GET" });
}

/**
 * GET /api/v1/incidents/{id}
 * Get a single AI incident by its ID.
 */
export async function getAdminIncidentById(id: string): Promise<AIIncident> {
  return apiClient<AIIncident>(`${BASE}/${id}`, { method: "GET" });
}

/**
 * POST /api/v1/incidents
 * Report a new AI incident.
 */
export async function createAdminIncident(
  payload: CreateIncidentDto
): Promise<AIIncident> {
  return apiClient<AIIncident>(BASE, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * PATCH /api/v1/incidents/{id}/resolve
 * Resolve an AI incident (human decision PV).
 */
export async function resolveAdminIncident(
  id: string,
  payload: ResolveIncidentDto
): Promise<AIIncident> {
  return apiClient<AIIncident>(`${BASE}/${id}/resolve`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * PATCH /api/v1/incidents/{id}/statut
 * Update the status of an AI incident without resolving it.
 */
export async function updateAdminIncidentStatut(
  id: string,
  statut: IncidentStatut
): Promise<AIIncident> {
  return apiClient<AIIncident>(`${BASE}/${id}/statut`, {
    method: "PATCH",
    body: JSON.stringify({ statut } satisfies UpdateIncidentStatutDto),
  });
}
