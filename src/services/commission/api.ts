import { apiClient } from "@/services/client";

// ─── Evaluations Overview ────────────────────────────────────────────────────

export interface CommissionEvaluationOverviewItem {
  id: string;
  commissionId: string;
  aoId: string;
  reference: string;
  objet: string;
  progressGlobal: number;
  phases: { phase: string; status: string }[];
  statut?: string;
  dateReunion?: string | null;
  createdAt?: string;
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

interface EvaluationLookupParams {
  commissionId?: string;
  aoId?: string;
  evaluationId?: string;
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

function extractArrayPayload(payload: unknown): unknown[] {
  const data = unwrapEnvelope<unknown>(payload);
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: unknown[] }).data;
  }
  return [];
}

function mapEvaluationOverviewItem(item: unknown): CommissionEvaluationOverviewItem | null {
  if (!item || typeof item !== "object") return null;
  const record = item as Record<string, unknown>;
  const aoId = String(record.appelOffreId ?? record.aoId ?? "");
  const commissionId = String(record.commissionId ?? "");
  const reference = String(record.reference ?? "");
  const objet = String(record.objet ?? "");
  const statut = typeof record.statut === "string" ? record.statut : undefined;

  if (!aoId && !commissionId && !reference && !objet) return null;

  return {
    id: String(record.id ?? ""),
    commissionId,
    aoId,
    reference,
    objet,
    progressGlobal: typeof record.progressGlobal === "number" ? record.progressGlobal : 0,
    phases: Array.isArray(record.phases) ? (record.phases as { phase: string; status: string }[]) : [],
    statut,
    dateReunion: typeof record.dateReunion === "string" ? record.dateReunion : null,
    createdAt: typeof record.createdAt === "string" ? record.createdAt : undefined,
  };
}

function mapEvaluationOverviewItems(payload: unknown): CommissionEvaluationOverviewItem[] {
  return extractArrayPayload(payload)
    .map(mapEvaluationOverviewItem)
    .filter((item): item is CommissionEvaluationOverviewItem => Boolean(item));
}

async function fetchEvaluationOverviewItems(
  params: Record<string, string> = {},
): Promise<CommissionEvaluationOverviewItem[]> {
  const query = new URLSearchParams({ page: "1", limit: "100", ...params }).toString();
  const raw = await apiClient<unknown>(`/api/v1/evaluations?${query}`, { method: "GET" });
  return mapEvaluationOverviewItems(raw);
}

// ─── API Functions ───────────────────────────────────────────────────────────

export async function getCommissionEvaluationsOverview(): Promise<CommissionEvaluationOverviewItem[]> {
  return fetchEvaluationOverviewItems();
}

export async function getCommissionEvaluationByContext({
  commissionId,
  aoId,
  evaluationId,
}: EvaluationLookupParams): Promise<CommissionEvaluationOverviewItem | null> {
  if (evaluationId) {
    const raw = await apiClient<unknown>(`/api/v1/evaluations/${evaluationId}`, {
      method: "GET",
    }).catch(() => null);
    const item = mapEvaluationOverviewItem(unwrapEnvelope<unknown>(raw));
    if (item?.id) return item;
  }

  if (commissionId) {
    const byCommission = await fetchEvaluationOverviewItems({ commissionId }).catch(() => []);
    const match = byCommission.find((item) => item.commissionId === commissionId) ?? byCommission[0];
    if (match?.id) return match;
  }

  if (aoId) {
    const byAo = await fetchEvaluationOverviewItems({ appelOffreId: aoId }).catch(() => []);
    const match = byAo.find((item) => item.aoId === aoId) ?? byAo[0];
    if (match?.id) return match;
  }

  return null;
}

export async function getCommissionEvaluationSubmissions(evaluationId: string): Promise<CommissionEvaluationSubmission[]> {
  const raw = await apiClient<unknown>(
    `/api/v1/evaluations/${evaluationId}/soumissions`,
    { method: "GET" },
  );
  const items = extractArrayPayload(raw);

  return items
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;

      return {
        id: String(record.id ?? ""),
        reference: String(record.reference ?? record.aliasAnonyme ?? ""),
        operatorName: String(
          record.operatorName ??
          record.operateurNom ??
          record.aliasAnonyme ??
          "Soumission",
        ),
        status: String(record.status ?? record.statut ?? ""),
      } as CommissionEvaluationSubmission;
    })
    .filter(
      (item): item is CommissionEvaluationSubmission =>
        Boolean(item?.id) && Boolean(item?.reference),
    );
}

export async function getCommissionEvaluationCriteria(evaluationId: string): Promise<CommissionEvaluationCriterion[]> {
  const raw = await apiClient<unknown>(
    `/api/v1/evaluations/${evaluationId}/criteres`,
    { method: "GET" },
  );
  const items = extractArrayPayload(raw);

  return items
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const criterion = item as Record<string, unknown>;

      return {
        id: criterion.id,
        label: String(criterion.libelle ?? criterion.label ?? ""),
        weight: Number(criterion.poids ?? criterion.weight ?? 0),
        type:
          String(criterion.categorie ?? criterion.type ?? "TECHNIQUE").toUpperCase() ===
          "FINANCIER"
            ? "financier"
            : "technique",
        noteEliminatoire:
          typeof criterion.noteMinimale === "number"
            ? criterion.noteMinimale
            : typeof criterion.noteEliminatoire === "number"
              ? criterion.noteEliminatoire
              : undefined,
      } as CommissionEvaluationCriterion;
    })
    .filter(
      (item): item is CommissionEvaluationCriterion =>
        Boolean(item?.id) && Boolean(item?.label),
    );
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
