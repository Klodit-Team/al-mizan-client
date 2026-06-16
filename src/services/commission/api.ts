import { apiClient } from "@/services/client";

// ─── Evaluations Overview ────────────────────────────────────────────────────

export interface CommissionEvaluationOverviewItem {
  aoId: string;
  reference: string;
  objet: string;
  progressGlobal: number;
  phases: { phase: string; status: string }[];
}

export interface CommissionEvaluationSubmission {
  id: string;
  reference: string;
  operatorName: string;
  status: string;
}

export interface CommissionEvaluationCriterion {
  id: string;
  label: string;
  weight: number;
  type: string;
  noteEliminatoire?: number;
}

export interface CommissionDocumentItem {
  id: string;
  label: string;
  fileName: string;
  status: string;
  ocrData?: unknown;
}

export interface CommissionDocumentDecisionPayload {
  decision: "valide" | "rejete";
  comment?: string;
}

export interface CommissionClassementRow {
  rank: number;
  submissionReference: string;
  operatorName: string;
  scoreGlobal: number;
  decision: string | null;
}

export interface CommissionClassementDecisionPayload {
  submissionId: string;
  decision: "retenu" | "elimine";
  reason?: string;
}

export interface CommissionPreDechiffrementData {
  aoId: string;
  reference: string;
  objet: string;
  members: { id: string; name: string; role: string; hasKey: boolean }[];
  submissions: { id: string; reference: string; operatorName: string }[];
  complianceSummary: { total: number; compliant: number; nonCompliant: number };
}

export interface CommissionDechiffrementData {
  aoId: string;
  submissions: { id: string; reference: string; operatorName: string; isDecrypted: boolean }[];
  seanceState: string;
}

export interface CommissionScoresPayload {
  scores: { submissionId: string; criterionId: string; score: number; justification?: string }[];
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
    ("success" in (payload as Record<string, unknown>) ||
      "statusCode" in (payload as Record<string, unknown>))
  ) {
    return (payload as ApiEnvelope<T>).data as T;
  }

  return payload as T;
}

// ─── API Functions ───────────────────────────────────────────────────────────

export async function getCommissionEvaluationsOverview(): Promise<CommissionEvaluationOverviewItem[]> {
  const raw = await apiClient<unknown>(
    "/api/v1/evaluations?page=1&limit=100",
    { method: "GET" },
  );
  return Array.isArray(raw) ? raw : [];
}

export async function getCommissionEvaluationSubmissions(aoId: string): Promise<CommissionEvaluationSubmission[]> {
  const raw = await apiClient<unknown>(
    `/api/v1/soumissions/appel-offre/${aoId}`,
    { method: "GET" },
  );
  return Array.isArray(raw) ? raw : [];
}

export async function getCommissionEvaluationCriteria(aoId: string): Promise<CommissionEvaluationCriterion[]> {
  const raw = await apiClient<unknown>(
    `/api/v1/appels-offres/${aoId}`,
    { method: "GET" },
  );
  const ao = unwrapEnvelope<{
    criteresEvaluation?: Array<{
      id: string;
      libelle?: string;
      categorie?: string;
      poids?: number;
      noteEliminatoire?: number;
    }>;
  }>(raw);

  return Array.isArray(ao?.criteresEvaluation)
    ? ao.criteresEvaluation.map((criterion) => ({
        id: criterion.id,
        label: criterion.libelle ?? "",
        weight: Number(criterion.poids ?? 0),
        type: String(criterion.categorie ?? "TECHNIQUE").toUpperCase() === "FINANCIER"
          ? "financier"
          : "technique",
        noteEliminatoire: criterion.noteEliminatoire,
      }))
    : [];
}

export async function saveCommissionEvaluationScores(
  evaluationId: string,
  payload: CommissionScoresPayload,
): Promise<void> {
  for (const score of payload.scores) {
    await apiClient<unknown>(
      `/api/v1/evaluations/${evaluationId}/soumissions/${score.submissionId}/notes`,
      {
        method: "POST",
        body: JSON.stringify({
          criterionId: score.criterionId,
          note: score.score,
          justification: score.justification,
        }),
      },
    );
  }
}

export async function getCommissionDocuments(soumissionId: string): Promise<CommissionDocumentItem[]> {
  const raw = await apiClient<unknown>(
    `/api/v1/documents/administrative/${soumissionId}`,
    { method: "GET" },
  );
  return Array.isArray(raw) ? raw : [];
}

export async function setCommissionDocumentDecision(
  documentId: string,
  payload: CommissionDocumentDecisionPayload,
): Promise<void> {
  await apiClient<unknown>(
    `/api/v1/documents/administrative/piece/${documentId}/validate`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function getCommissionClassement(aoId: string): Promise<CommissionClassementRow[]> {
  // Get evaluation for this AO, then get its classement
  const evaluations = await apiClient<{ id: string }[]>(
    `/api/v1/evaluations?appelOffreId=${aoId}`,
    { method: "GET" },
  ).catch(() => []);

  if (!evaluations.length) return [];

  const raw = await apiClient<unknown>(
    `/api/v1/evaluations/${evaluations[0].id}/classement`,
    { method: "GET" },
  ).catch(() => []);

  return Array.isArray(raw) ? raw : [];
}

export async function setCommissionClassementDecision(
  aoId: string,
  payload: CommissionClassementDecisionPayload,
): Promise<void> {
  const evaluations = await apiClient<{ id: string }[]>(
    `/api/v1/evaluations?appelOffreId=${aoId}`,
    { method: "GET" },
  );

  if (!evaluations.length) throw new Error("Evaluation introuvable");

  await apiClient<unknown>(
    `/api/v1/evaluations/${evaluations[0].id}/soumissions/${payload.submissionId}`,
    { method: "PUT", body: JSON.stringify({ decision: payload.decision, reason: payload.reason }) },
  );
}

export async function getCommissionPreDechiffrement(offreId: string): Promise<CommissionPreDechiffrementData> {
  // Use seances-ouverture endpoint
  return apiClient<CommissionPreDechiffrementData>(
    `/api/v1/seances-ouverture/${offreId}`,
    { method: "GET" },
  );
}

export async function getCommissionDechiffrement(offreId: string): Promise<CommissionDechiffrementData> {
  return apiClient<CommissionDechiffrementData>(
    `/api/v1/seances-ouverture/${offreId}/resultats`,
    { method: "GET" },
  );
}

export async function unlockCommissionDechiffrement(offreId: string): Promise<void> {
  await apiClient<unknown>(
    `/api/v1/seances-ouverture/${offreId}/demarrer`,
    { method: "PATCH" },
  );
}
