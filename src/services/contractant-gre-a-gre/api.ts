import { apiClient } from "@/services/client";

export type GreAGreRequestStatus =
  | "brouillon"
  | "soumise"
  | "en_analyse_ia"
  | "acceptee"
  | "rejetee"
  | "en_revision";

export interface GreAGreJustificationPayload {
  type: string;
  description: string;
  fileName?: string;
  order: number;
}

export interface GreAGreRequestListItem {
  id: string;
  reference: string;
  object: string;
  estimatedAmount: string;
  status: GreAGreRequestStatus;
  submittedAt: string;
  iaComplianceScore: number | null;
}

export interface GreAGreRequestDetail extends GreAGreRequestListItem {
  description: string;
  justifications: GreAGreJustificationPayload[];
  iaAnalysis: unknown | null;
  controllerDecision: unknown | null;
}

export interface SubmitGreAGreRequestPayload {
  reference: string;
  object: string;
  description: string;
  estimatedAmount: string;
  justifications: GreAGreJustificationPayload[];
}

interface ApiEnvelope<T> {
  data?: T;
  success?: boolean;
  statusCode?: number;
}

function unwrapEnvelope<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in (payload as Record<string, unknown>) &&
    ("success" in (payload as Record<string, unknown>) || "statusCode" in (payload as Record<string, unknown>))
  ) {
    return (payload as ApiEnvelope<T>).data as T;
  }
  return payload as T;
}

export async function listGreAGreRequests(): Promise<GreAGreRequestListItem[]> {
  const raw = await apiClient<unknown>(
    "/api/v1/appels-offres?typeProcedure=GRE_A_GRE&page=1&limit=100",
    { method: "GET" },
  );
  const items = unwrapEnvelope<GreAGreRequestListItem[]>(raw);
  return Array.isArray(items) ? items : [];
}

export async function getGreAGreRequestById(id: string): Promise<GreAGreRequestDetail | null> {
  try {
    const raw = await apiClient<unknown>(
      `/api/v1/appels-offres/${id}`,
      { method: "GET" },
    );
    return unwrapEnvelope<GreAGreRequestDetail>(raw);
  } catch {
    return null;
  }
}

export async function submitGreAGreRequest(
  payload: SubmitGreAGreRequestPayload,
): Promise<GreAGreRequestDetail> {
  // Create the AO with gre-a-gre type, then submit it
  const raw = await apiClient<unknown>(
    "/api/v1/appels-offres",
    {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        typeProcedure: "GRE_A_GRE",
      }),
    },
  );
  const created = unwrapEnvelope<{ id: string }>(raw);

  // Submit for validation
  await apiClient<unknown>(
    `/api/v1/appels-offres/${created.id}/gre-a-gre/soumettre`,
    { method: "POST", body: JSON.stringify(payload) },
  );

  return getGreAGreRequestById(created.id) as Promise<GreAGreRequestDetail>;
}

export async function resubmitGreAGreRequest(
  id: string,
  payload: SubmitGreAGreRequestPayload,
): Promise<GreAGreRequestDetail> {
  await apiClient<unknown>(
    `/api/v1/appels-offres/${id}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );

  await apiClient<unknown>(
    `/api/v1/appels-offres/${id}/gre-a-gre/soumettre`,
    { method: "POST", body: JSON.stringify(payload) },
  );

  return getGreAGreRequestById(id) as Promise<GreAGreRequestDetail>;
}
