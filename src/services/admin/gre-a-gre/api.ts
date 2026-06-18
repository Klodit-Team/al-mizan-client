import { apiClient } from "@/services/client";

export type AdminGreAGreStatus =
  | "BROUILLON"
  | "SOUMISE"
  | "EN_ANALYSE_IA"
  | "ACCEPTEE"
  | "REJETEE"
  | "EN_REVISION";

export type AdminGreAGreRecommendation =
  | "ACCEPTER"
  | "REJETER"
  | "DEMANDER_COMPLEMENTS";

export interface AdminGreAGreAo {
  id: string;
  reference: string;
  objet: string;
  montantEstime: number | string;
  statut: string;
  serviceContractantId: string;
  wilaya?: string;
  secteurActivite?: string;
  createdAt?: string;
}

export interface AdminGreAGreJustification {
  id: string;
  typeJustification: string;
  description: string;
  documentId?: string | null;
  ordre: number;
  createdAt: string;
}

export interface AdminGreAGreIaEvaluation {
  id: string;
  modeleIa: string;
  scoreConformite: number | string;
  recommandation: AdminGreAGreRecommendation;
  justificationIa: string;
  confianceScore: number | string;
  dateAnalyse: string;
}

export interface AdminGreAGreDecision {
  id: string;
  controleurId: string;
  decisionFinale: AdminGreAGreRecommendation;
  motifDecision: string;
  correspondIa: boolean;
  dateDecision: string;
}

export interface AdminGreAGreDemand {
  id: string;
  aoId: string;
  serviceContractantId: string;
  statut: AdminGreAGreStatus;
  createdAt: string;
  updatedAt: string;
  appelOffres?: AdminGreAGreAo;
  appelOffre?: AdminGreAGreAo;
  appel_offres?: AdminGreAGreAo;
  ao?: AdminGreAGreAo;
  justifications: AdminGreAGreJustification[];
  evaluationsIa: AdminGreAGreIaEvaluation[];
  decisions: AdminGreAGreDecision[];
}

export interface AdminGreAGreListResponse {
  data: AdminGreAGreDemand[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages?: number;
  };
}

export interface ListAdminGreAGreParams {
  page?: number;
  limit?: number;
  statut?: AdminGreAGreStatus;
  aoId?: string;
  serviceContractantId?: string;
}

export interface ValidateAdminGreAGrePayload {
  decision: "ACCEPTER" | "REJETER";
  motif: string;
}

const BASE = "/api/v1/appels-offres/gre-a-gre";

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

function unwrapData<T>(payload: T | ApiEnvelope<T>): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    ("success" in payload || "message" in payload)
  ) {
    return (payload as ApiEnvelope<T>).data as T;
  }
  return payload as T;
}

function normalizeListResponse(payload: unknown): AdminGreAGreListResponse {
  const unwrapped = unwrapData(payload as AdminGreAGreListResponse | ApiEnvelope<AdminGreAGreListResponse>);

  if (Array.isArray(unwrapped)) {
    return {
      data: unwrapped as AdminGreAGreDemand[],
      meta: {
        total: unwrapped.length,
        page: 1,
        limit: unwrapped.length,
        totalPages: 1,
      },
    };
  }

  if (unwrapped && typeof unwrapped === "object") {
    const record = unwrapped as Partial<AdminGreAGreListResponse>;
    return {
      data: Array.isArray(record.data) ? record.data : [],
      meta: {
        total: Number(record.meta?.total ?? record.data?.length ?? 0),
        page: Number(record.meta?.page ?? 1),
        limit: Number(record.meta?.limit ?? record.data?.length ?? 0),
        totalPages: Number(record.meta?.totalPages ?? 1),
      },
    };
  }

  return { data: [], meta: { total: 0, page: 1, limit: 0, totalPages: 1 } };
}

export async function listAdminGreAGreDemands(
  params: ListAdminGreAGreParams = {},
): Promise<AdminGreAGreListResponse> {
  const qs = new URLSearchParams();
  if (params.page !== undefined) qs.set("page", String(params.page));
  if (params.limit !== undefined) qs.set("limit", String(params.limit));
  if (params.statut) qs.set("statut", params.statut);
  if (params.aoId) qs.set("aoId", params.aoId);
  if (params.serviceContractantId) qs.set("serviceContractantId", params.serviceContractantId);

  const query = qs.toString() ? `?${qs.toString()}` : "";
  const payload = await apiClient<AdminGreAGreListResponse | AdminGreAGreDemand[] | ApiEnvelope<AdminGreAGreListResponse>>(
    `${BASE}${query}`,
    { method: "GET" },
  );
  return normalizeListResponse(payload);
}

export async function getAdminGreAGreDemand(id: string): Promise<AdminGreAGreDemand> {
  const payload = await apiClient<AdminGreAGreDemand | ApiEnvelope<AdminGreAGreDemand>>(
    `${BASE}/${id}`,
    { method: "GET" },
  );
  return unwrapData(payload);
}

export async function validateAdminGreAGreDemand(
  id: string,
  payload: ValidateAdminGreAGrePayload,
): Promise<unknown> {
  const response = await apiClient<unknown | ApiEnvelope<unknown>>(`${BASE}/${id}/valider`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return unwrapData(response);
}
