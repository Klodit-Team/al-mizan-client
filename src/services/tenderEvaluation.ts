export type TenderEvaluationPhase = "eligibilite" | "technique" | "financiere";

export type TenderEvaluationPhaseStatus = "en_cours" | "terminee" | "validee";

export type TenderEvaluationDecision = "retenu" | "elimine";

export interface TenderEvaluationPhaseOverviewItem {
  phase: TenderEvaluationPhase;
  label: string;
  status: TenderEvaluationPhaseStatus;
  updatedAt: string;
}

export interface TenderEvaluationScoreRow {
  submissionReference: string;
  scoreTechnique: number;
  scoreFinancier: number;
  scoreGlobal: number;
  ranking: number;
  decision: TenderEvaluationDecision;
}

export interface TenderEvaluationIaComparisonRow {
  submissionReference: string;
  commissionScore: number;
  iaScore: number;
  matches: boolean;
  deviation: number;
  divergenceReason: string;
}

export interface TenderEvaluationReport {
  generated: boolean;
  fileName: string | null;
  fileUrl: string | null;
}

export interface ServiceContractantTenderEvaluationPhaseDetail {
  aoId: string;
  phase: TenderEvaluationPhase;
  label: string;
  status: TenderEvaluationPhaseStatus;
  scores: TenderEvaluationScoreRow[];
  iaComparisons: TenderEvaluationIaComparisonRow[];
  report: TenderEvaluationReport;
  canValidate: boolean;
  validatedAt: string | null;
}

const API_BASE_URL = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "");

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;

  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  const json = await response.json();

  // Unwrap paginated responses { data: [...] }
  if (json && typeof json === "object" && "data" in json && Array.isArray(json.data)) {
    return json.data as T;
  }

  return json as T;
}

export async function listServiceContractantTenderEvaluationPhases(
  aoId: string,
): Promise<TenderEvaluationPhaseOverviewItem[]> {
  try {
    return await requestJson<TenderEvaluationPhaseOverviewItem[]>(
      `/api/v1/evaluations?appelOffreId=${aoId}`,
      {
        method: "GET",
      },
    );
  } catch {
    return [];
  }
}

export async function getServiceContractantTenderEvaluationPhaseDetail(
  aoId: string,
  phase: TenderEvaluationPhase,
): Promise<ServiceContractantTenderEvaluationPhaseDetail | null> {
  try {
    return await requestJson<ServiceContractantTenderEvaluationPhaseDetail>(
      `/api/v1/evaluations?appelOffreId=${aoId}&phase=${phase}`,
      {
        method: "GET",
      },
    );
  } catch {
    return null;
  }
}

export async function validateServiceContractantTenderEvaluationPhase(
  evaluationId: string,
): Promise<ServiceContractantTenderEvaluationPhaseDetail | null> {
  try {
    // The spec indicates PATCH /api/v1/evaluations/{id}/statut to change status.
    // We'll assume 'VALIDEE' is the correct status for validation.
    const response = await requestJson<any>(
      `/api/v1/evaluations/${evaluationId}/statut`,
      {
        method: "PATCH",
        body: JSON.stringify({ statut: "VALIDEE" }),
      },
    );

    // The response from the status update might not be the full detail object.
    // We may need to refetch the details. For now, we'll assume the updated
    // evaluation object is returned and we can get what we need from it.
    if (response && response.id) {
        return getServiceContractantTenderEvaluationPhaseDetail(response.appelOffreId, response.type.toLowerCase());
    }

    return null;
  } catch (err) {
    console.error("Failed to validate evaluation phase:", err);
    return null;
  }
}
