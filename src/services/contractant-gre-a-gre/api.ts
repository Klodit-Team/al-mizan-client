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
  // We must map frontend properties to the required CreateAppelOffreDto fields.
  // We use dummy values for dates/wilaya/secteurActivite if they aren't provided by the form,
  // since a Gré-à-Gré doesn't have a public submission deadline.
  // We also need to map object -> objet, estimatedAmount -> montantEstime.
  // Note: We'll retrieve the current user's profile to get the serviceContractantId if needed,
  // or we can pass a placeholder that the backend might bypass or we can fetch the user profile.
  // Wait, if we use a dummy UUID for serviceContractantId, it might break validation if it checks the DB.
  // Let's first fetch the user profile to get the ID.
  const meRaw = await apiClient<unknown>('/api/v1/auth/me', { method: 'GET' }).catch(() => null);
  const me = unwrapEnvelope<any>(meRaw);
  const serviceContractantId = me?.user?.userId || '00000000-0000-0000-0000-000000000000';

  const createAppelOffrePayload = {
    reference: payload.reference,
    objet: payload.object,
    typeProcedure: "GRE_A_GRE",
    montantEstime: Number(payload.estimatedAmount) || 1,
    dateLimiteSoumission: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    dateLimiteRetraitCdc: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    wilaya: "Non spécifié",
    secteurActivite: "Non spécifié",
    serviceContractantId,
  };

  const raw = await apiClient<unknown>(
    "/api/v1/appels-offres",
    {
      method: "POST",
      body: JSON.stringify(createAppelOffrePayload),
    },
  );
  const created = unwrapEnvelope<{ id: string }>(raw);

  // Map frontend payload to match backend DTO
  const submitDto = {
    ...payload,
    justifications: payload.justifications.map((j) => ({
      type_justification: j.type, // Map 'type' to 'type_justification'
      description: j.description,
      // If the backend accepts documentId in the future, it would go here
    })),
  };

  // Submit for validation
  await apiClient<unknown>(
    `/api/v1/appels-offres/${created.id}/gre-a-gre/soumettre`,
    { method: "POST", body: JSON.stringify(submitDto) },
  );

  return getGreAGreRequestById(created.id) as Promise<GreAGreRequestDetail>;
}

export async function resubmitGreAGreRequest(
  id: string,
  payload: SubmitGreAGreRequestPayload,
): Promise<GreAGreRequestDetail> {
  const updateAppelOffrePayload = {
    reference: payload.reference,
    objet: payload.object,
    montantEstime: Number(payload.estimatedAmount) || 1,
  };

  await apiClient<unknown>(
    `/api/v1/appels-offres/${id}`,
    { method: "PATCH", body: JSON.stringify(updateAppelOffrePayload) },
  );

  // Map frontend payload to match backend DTO
  const submitDto = {
    ...payload,
    justifications: payload.justifications.map((j) => ({
      type_justification: j.type,
      description: j.description,
    })),
  };

  await apiClient<unknown>(
    `/api/v1/appels-offres/${id}/gre-a-gre/soumettre`,
    { method: "POST", body: JSON.stringify(submitDto) },
  );

  return getGreAGreRequestById(id) as Promise<GreAGreRequestDetail>;
}
