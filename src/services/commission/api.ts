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
  externalSubmissionId: string;
  reference: string;
  operatorName: string;
  status: string;
  lotId?: string | null;
  scoreTechnique?: number | null;
  scoreGlobal?: number | null;
  rang?: number | null;
  recommandation?: string | null;
  source: "evaluation" | "ao";
}

export interface CommissionEvaluationCriterion {
  id: string;
  code?: string;
  label: string;
  weight: number;
  type: string;
  noteMax: number;
  description?: string | null;
  noteEliminatoire?: number;
  eliminatoire?: boolean;
  source: "evaluation" | "ao";
}

export interface CommissionEvaluationNote {
  id: string;
  criterionId: string;
  criterionCode?: string;
  criterionLabel?: string;
  evaluatorId: string;
  evaluatorName?: string | null;
  source: "HUMAIN" | "IA" | string;
  note: number;
  justification: string;
  scoreConfiance?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommissionAoAnomalies {
  totalAnomalies: number;
  breakdown: Record<string, number>;
  flaggedBids: {
    soumissionId?: string;
    anomalyType?: string;
    detail?: string;
    confidence?: number;
  }[];
}

export interface CommissionAoDetail {
  id: string;
  reference?: string;
  objet?: string;
  criteresEvaluation: {
    id: string;
    libelle?: string;
    categorie?: string;
    poids?: number;
    noteEliminatoire?: number;
  }[];
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

export interface CommissionEvaluationSubmissionRegistrationPayload {
  externalSubmissionId: string;
  operateurEconomiqueId?: string;
  operateurNom?: string;
  lotId?: string;
  montantOffre?: number;
  devise?: string;
  metadata?: Record<string, unknown>;
}

export interface CommissionEvaluationCriterionCreationPayload {
  code: string;
  libelle: string;
  description?: string;
  poids: number;
  noteMax?: number;
  noteMinimale?: number;
  eliminatoire?: boolean;
  ordre?: number;
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
  return mapCommissionEvaluationSubmissions(raw, "evaluation");
}

export async function registerCommissionEvaluationSubmission(
  evaluationId: string,
  payload: CommissionEvaluationSubmissionRegistrationPayload,
): Promise<CommissionEvaluationSubmission> {
  const raw = await apiClient<unknown>(
    `/api/v1/evaluations/${evaluationId}/soumissions`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
  const submission = mapCommissionEvaluationSubmission(
    unwrapEnvelope<unknown>(raw),
    "evaluation",
  );
  if (submission) return submission;
  throw new Error("Impossible de transformer la soumission créée.");
}

export async function createCommissionEvaluationCriterion(
  evaluationId: string,
  payload: CommissionEvaluationCriterionCreationPayload,
): Promise<CommissionEvaluationCriterion> {
  const raw = await apiClient<unknown>(
    `/api/v1/evaluations/${evaluationId}/criteres`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
  const criterion = mapCommissionEvaluationCriterion(
    unwrapEnvelope<unknown>(raw),
    "evaluation",
  );
  if (criterion) return criterion;
  throw new Error("Impossible de transformer le critère créé.");
}

export async function getCommissionAoSubmissions(aoId: string): Promise<CommissionEvaluationSubmission[]> {
  const raw = await apiClient<unknown>(
    `/api/v1/soumissions/appel-offre/${aoId}`,
    { method: "GET" },
  );
  return mapCommissionEvaluationSubmissions(raw, "ao");
}

function mapCommissionEvaluationSubmissions(
  payload: unknown,
  source: "evaluation" | "ao",
): CommissionEvaluationSubmission[] {
  return extractArrayPayload(payload)
    .map((item) => {
      return mapCommissionEvaluationSubmission(item, source);
    })
    .filter(
      (item): item is CommissionEvaluationSubmission =>
        Boolean(item?.id) && Boolean(item?.reference),
    );
}

function mapCommissionEvaluationSubmission(
  item: unknown,
  source: "evaluation" | "ao",
): CommissionEvaluationSubmission | null {
  if (!item || typeof item !== "object") return null;
  const record = item as Record<string, unknown>;
  const id = String(record.id ?? "");
  const externalSubmissionId = String(record.externalSubmissionId ?? record.soumissionId ?? id);
  const alias = String(record.aliasAnonyme ?? "");
  const reference = String(record.reference ?? alias) || externalSubmissionId;
  const operatorRaw =
    record.operatorName ??
    record.operateurNom ??
    record.operatorOrganizationName ??
    record.operateurId ??
    alias;

  return {
    id,
    externalSubmissionId,
    reference,
    operatorName: operatorRaw ? String(operatorRaw) : "Soumission",
    status: String(record.status ?? record.statut ?? ""),
    lotId: typeof record.lotId === "string" ? record.lotId : null,
    scoreTechnique: toNullableNumber(record.scoreTechnique),
    scoreGlobal: toNullableNumber(record.scoreGlobal),
    rang: toNullableNumber(record.rang),
    recommandation:
      typeof record.recommandation === "string" ? record.recommandation : null,
    source,
  };
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export async function getCommissionEvaluationCriteria(evaluationId: string): Promise<CommissionEvaluationCriterion[]> {
  const raw = await apiClient<unknown>(
    `/api/v1/evaluations/${evaluationId}/criteres`,
    { method: "GET" },
  );
  return mapCommissionEvaluationCriteria(raw, "evaluation");
}

export async function getCommissionAoCriteria(aoId: string): Promise<CommissionEvaluationCriterion[]> {
  const raw = await apiClient<unknown>(
    `/api/v1/appels-offres/${aoId}/criteres-evaluation`,
    { method: "GET" },
  ).catch(() => []);
  return mapCommissionEvaluationCriteria(raw, "ao");
}

export async function getCommissionAoDetail(aoId: string): Promise<CommissionAoDetail | null> {
  if (!aoId) return null;
  const raw = await apiClient<unknown>(`/api/v1/appels-offres/${aoId}`, { method: "GET" }).catch(() => null);
  const data = unwrapEnvelope<unknown>(raw);
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  return {
    id: String(record.id ?? ""),
    reference: typeof record.reference === "string" ? record.reference : undefined,
    objet: typeof record.objet === "string" ? record.objet : undefined,
    criteresEvaluation: Array.isArray(record.criteresEvaluation)
      ? (record.criteresEvaluation as CommissionAoDetail["criteresEvaluation"])
      : [],
  };
}

function mapCommissionEvaluationCriteria(
  payload: unknown,
  source: "evaluation" | "ao",
): CommissionEvaluationCriterion[] {
  return extractArrayPayload(payload)
    .map((item) => {
      return mapCommissionEvaluationCriterion(item, source);
    })
    .filter(
      (item): item is CommissionEvaluationCriterion =>
        Boolean(item?.id) && Boolean(item?.label),
    );
}

function mapCommissionEvaluationCriterion(
  item: unknown,
  source: "evaluation" | "ao",
): CommissionEvaluationCriterion | null {
  if (!item || typeof item !== "object") return null;
  const criterion = item as Record<string, unknown>;
  const code =
    typeof criterion.code === "string"
      ? criterion.code
      : typeof criterion.categorie === "string"
        ? criterion.categorie
        : undefined;
  const label = String(criterion.libelle ?? criterion.label ?? "");
  const noteMax = Number(criterion.noteMax ?? 100);

  return {
    id: String(criterion.id ?? ""),
    code,
    label,
    weight: Number(criterion.poids ?? criterion.weight ?? 0),
    type:
      String(criterion.categorie ?? criterion.type ?? "TECHNIQUE").toUpperCase() ===
      "FINANCIER"
        ? "financier"
        : "technique",
    noteMax: Number.isFinite(noteMax) && noteMax > 0 ? noteMax : 100,
    description:
      typeof criterion.description === "string" ? criterion.description : null,
    noteEliminatoire:
      toNullableNumber(criterion.noteMinimale) ??
      toNullableNumber(criterion.noteEliminatoire) ??
      undefined,
    eliminatoire:
      typeof criterion.eliminatoire === "boolean"
        ? criterion.eliminatoire
        : Boolean(criterion.noteEliminatoire ?? criterion.noteMinimale),
    source,
  };
}

export async function getCommissionEvaluationNotes(
  evaluationId: string,
  submissionId: string,
): Promise<CommissionEvaluationNote[]> {
  const raw = await apiClient<unknown>(
    `/api/v1/evaluations/${evaluationId}/soumissions/${submissionId}/notes`,
    { method: "GET" },
  );
  return extractArrayPayload(raw)
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const note = Number(record.note ?? 0);
      return {
        id: String(record.id ?? ""),
        criterionId: String(record.criterionId ?? ""),
        criterionCode:
          typeof record.criterionCode === "string" ? record.criterionCode : undefined,
        criterionLabel:
          typeof record.criterionLabel === "string" ? record.criterionLabel : undefined,
        evaluatorId: String(record.evaluatorId ?? ""),
        evaluatorName:
          typeof record.evaluatorName === "string" ? record.evaluatorName : null,
        source: String(record.source ?? "HUMAIN"),
        note: Number.isFinite(note) ? note : 0,
        justification: String(record.justification ?? ""),
        scoreConfiance: toNullableNumber(record.scoreConfiance),
        createdAt: typeof record.createdAt === "string" ? record.createdAt : undefined,
        updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : undefined,
      } as CommissionEvaluationNote;
    })
    .filter(
      (item): item is CommissionEvaluationNote =>
        Boolean(item?.id) && Boolean(item?.criterionId),
    );
}

export async function getCommissionAoAnomalies(aoId: string): Promise<CommissionAoAnomalies> {
  const raw = await apiClient<unknown>(
    `/api/v1/soumissions/appel-offre/${aoId}/anomalies`,
    { method: "GET" },
  ).catch(() => null);
  const data = unwrapEnvelope<unknown>(raw);
  if (!data || typeof data !== "object") {
    return { totalAnomalies: 0, breakdown: {}, flaggedBids: [] };
  }
  const record = data as Record<string, unknown>;
  return {
    totalAnomalies: Number(record.totalAnomalies ?? 0),
    breakdown:
      record.breakdown && typeof record.breakdown === "object"
        ? (record.breakdown as Record<string, number>)
        : {},
    flaggedBids: Array.isArray(record.flaggedBids)
      ? (record.flaggedBids as CommissionAoAnomalies["flaggedBids"])
      : [],
  };
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
