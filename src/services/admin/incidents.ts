import { apiClient } from "@/services/client";

/** Mapped from audit service IncidentIaEntity */
export interface AIIncident {
  id: string;
  type_incident: "ANOMALY" | "DIVERGENCE_EVALUATION" | "DIVERGENCE_GRE_A_GRE" | "LOW_CONFIDENCE_OCR" | string;
  entite_source: string;
  entite_id: string;
  gravite: "FAIBLE" | "MOYENNE" | "ELEVEE" | "CRITIQUE";
  statut: "EMISE" | "EN_COURS" | "RESOLU" | "FERME" | string;
  decision_ia?: string;
  decision_humaine?: string;
  ecart_score?: number;
  confiance_ia?: number;
  date_detection: string;
  date_resolution?: string;
  notes_resolution?: string;
  donnees_contexte?: Record<string, unknown>;
}

export interface ResolveIncidentInput {
  statut: "EN_COURS" | "RESOLU" | "FERME";
  decision_humaine?: string;
  notes_resolution?: string;
}

const INCIDENTS_BASE_PATH = "/api/v1/audit/incidents";

export async function getAdminIncidents(): Promise<AIIncident[]> {
  const raw = await apiClient<unknown>(`${INCIDENTS_BASE_PATH}`, { method: "GET" });
  const payload = (raw as any)?.data ?? raw;
  return Array.isArray(payload) ? payload : (payload as any)?.data ?? [];
}

export async function resolveAdminIncident(
  incidentId: string,
  payload: ResolveIncidentInput,
): Promise<void> {
  await apiClient<void>(`${INCIDENTS_BASE_PATH}/${incidentId}/resolve`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
