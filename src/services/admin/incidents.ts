import { apiClient } from "@/services/client";

export interface AIIncident {
  incidentId: string;
  utilisateursCibles: string[];
  titre: string;
  message: string;
  niveauUrgence: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  typeAlerte: "DIVERGENCE_GRE_A_GRE" | string;
  donneesContexte: Record<string, any>;
  statut: "EMISE" | string;
  created_at?: string;
}

export interface ResolveIncidentInput {
  statut?: "EMISE" | string;
  resolutionNotes?: string;
}
const INCIDENTS_BASE_PATH = "/api/v1/audit/incidents";
export async function getAdminIncidents(): Promise<AIIncident[]> {
  return apiClient<AIIncident[]>(`${INCIDENTS_BASE_PATH}`, {
    method: "GET",
  });
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
