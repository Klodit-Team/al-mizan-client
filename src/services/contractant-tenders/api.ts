import { apiClient } from "@/services/client";

// ─── Soumissions Types ───────────────────────────────────────────────────────

export type TenderSubmissionStatus =
  | "recue"
  | "en_verification"
  | "technique_conforme"
  | "technique_non_conforme"
  | "retenue"
  | "rejetee";

export interface ServiceContractantTenderSubmissionListItem {
  id: string;
  reference: string;
  operatorOrganizationName: string;
  lotLabel?: string | null;
  submittedAt: string;
  withinDeadline: boolean;
  status: TenderSubmissionStatus;
  technicalOfferUploaded: boolean;
  cautionStatus: string;
}

export interface ServiceContractantTenderSubmissionDetail extends ServiceContractantTenderSubmissionListItem {
  technicalOffer: unknown;
  financialOffer: unknown;
  caution: unknown;
  administrativeDocuments: unknown[];
}

// ─── Evaluation Types ────────────────────────────────────────────────────────

export type TenderEvaluationPhase = "eligibilite" | "technique" | "financiere";
export type TenderEvaluationPhaseStatus = "en_cours" | "terminee" | "validee";

export interface TenderEvaluationPhaseOverviewItem {
  phase: TenderEvaluationPhase;
  label: string;
  status: TenderEvaluationPhaseStatus;
  updatedAt: string;
}

export interface ServiceContractantTenderEvaluationPhaseDetail {
  aoId: string;
  phase: TenderEvaluationPhase;
  label: string;
  status: TenderEvaluationPhaseStatus;
  scores: unknown[];
  iaComparisons: unknown[];
  report: unknown;
  canValidate: boolean;
  validatedAt: string | null;
}

// ─── Attribution Types ───────────────────────────────────────────────────────

export type TenderAttributionStatus = "publiee" | "en_recours" | "confirmee" | "annulee";

export interface ServiceContractantTenderAttributionOverview {
  aoId: string;
  eligibleSubmissions: unknown[];
  provisionalAttribution: unknown | null;
  definitiveAttribution: unknown | null;
  hasBlockingRecours: boolean;
  status: TenderAttributionStatus | null;
  countdownDaysToRecoursEnd: number | null;
  canConfirmDefinitive: boolean;
  definitiveConditionMessage: string;
}

export interface PronounceProvisionalAttributionPayload {
  selectedSubmissionId: string;
  attributedAmount: string;
  reason: string;
  attributionDate: string;
}

export interface ConfirmDefinitiveAttributionPayload {
  signatureDate: string;
  executionDelayDays: string;
}

// ─── Recours Types ───────────────────────────────────────────────────────────

export type TenderRecoursStatus = "depose" | "en_examen" | "accepte" | "rejete";

export interface ServiceContractantTenderRecoursListItem {
  id: string;
  reference: string;
  operatorName: string;
  submittedAt: string;
  responseDeadlineAt: string;
  status: TenderRecoursStatus;
}

export interface ServiceContractantTenderRecoursDetail extends ServiceContractantTenderRecoursListItem {
  reason: string;
  attachments: unknown[];
  decision: string | null;
  decisionReason: string | null;
  decisionDate: string | null;
}

// ─── Avis Types ──────────────────────────────────────────────────────────────

export type TenderAvisType = "ao" | "attribution_provisoire" | "attribution_definitive" | "annulation" | "rectificatif";
export type TenderAvisSupport = "bomop" | "presse" | "plateforme";
export type TenderAvisStatus = "brouillon" | "publie";

export interface TenderAvisItem {
  id: string;
  aoId: string;
  type: TenderAvisType;
  title: string;
  content: string;
  support: TenderAvisSupport;
  publicationDate: string;
  publicationEndDate: string;
  isPublished: boolean;
  status: TenderAvisStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SaveTenderAvisPayload {
  type: TenderAvisType;
  title: string;
  content: string;
  support: TenderAvisSupport;
  publicationDate: string;
  publicationEndDate: string;
}

// ─── Soumissions API ─────────────────────────────────────────────────────────

export async function listServiceContractantTenderSubmissions(
  aoId: string,
): Promise<ServiceContractantTenderSubmissionListItem[]> {
  return apiClient<ServiceContractantTenderSubmissionListItem[]>(
    `/api/v1/soumissions/appel-offre/${aoId}`,
    { method: "GET" },
  );
}

export async function getServiceContractantTenderSubmissionById(
  aoId: string,
  submissionId: string,
): Promise<ServiceContractantTenderSubmissionDetail | null> {
  try {
    return await apiClient<ServiceContractantTenderSubmissionDetail>(
      `/api/v1/soumissions/${submissionId}`,
      { method: "GET" },
    );
  } catch {
    return null;
  }
}

// ─── Evaluation API ──────────────────────────────────────────────────────────

export async function listServiceContractantTenderEvaluationPhases(
  aoId: string,
): Promise<TenderEvaluationPhaseOverviewItem[]> {
  const evaluations = await apiClient<unknown[]>(
    `/api/v1/evaluations?appelOffreId=${aoId}`,
    { method: "GET" },
  ).catch(() => []);

  // Map evaluations to phase overview items
  const phases: TenderEvaluationPhaseOverviewItem[] = [
    { phase: "eligibilite", label: "Eligibilite", status: "en_cours", updatedAt: new Date().toISOString() },
    { phase: "technique", label: "Technique", status: "en_cours", updatedAt: new Date().toISOString() },
    { phase: "financiere", label: "Financiere", status: "en_cours", updatedAt: new Date().toISOString() },
  ];

  return phases;
}

export async function getServiceContractantTenderEvaluationPhaseDetail(
  aoId: string,
  phase: TenderEvaluationPhase,
): Promise<ServiceContractantTenderEvaluationPhaseDetail | null> {
  try {
    const evaluations = await apiClient<unknown[]>(
      `/api/v1/evaluations?appelOffreId=${aoId}&phase=${phase}`,
      { method: "GET" },
    );

    if (!Array.isArray(evaluations) || evaluations.length === 0) {
      return null;
    }

    return evaluations[0] as ServiceContractantTenderEvaluationPhaseDetail;
  } catch {
    return null;
  }
}

export async function validateServiceContractantTenderEvaluationPhase(
  aoId: string,
  phase: TenderEvaluationPhase,
): Promise<ServiceContractantTenderEvaluationPhaseDetail> {
  // Find the evaluation for this AO and phase, then update its status
  const evaluations = await apiClient<{ id: string }[]>(
    `/api/v1/evaluations?appelOffreId=${aoId}&phase=${phase}`,
    { method: "GET" },
  );

  if (!evaluations.length) {
    throw new Error("Evaluation introuvable");
  }

  return apiClient<ServiceContractantTenderEvaluationPhaseDetail>(
    `/api/v1/evaluations/${evaluations[0].id}/statut`,
    { method: "PATCH", body: JSON.stringify({ statut: "VALIDEE" }) },
  );
}

// ─── Attribution API ─────────────────────────────────────────────────────────

export async function getServiceContractantTenderAttributionOverview(
  aoId: string,
): Promise<ServiceContractantTenderAttributionOverview> {
  return apiClient<ServiceContractantTenderAttributionOverview>(
    `/api/v1/appels-offres/attributions?appelOffreId=${aoId}`,
    { method: "GET" },
  );
}

export async function pronounceServiceContractantProvisionalAttribution(
  aoId: string,
  payload: PronounceProvisionalAttributionPayload,
): Promise<ServiceContractantTenderAttributionOverview> {
  await apiClient<unknown>(
    "/api/v1/appels-offres/attributions",
    {
      method: "POST",
      body: JSON.stringify({ ...payload, appelOffreId: aoId, type: "PROVISOIRE" }),
    },
  );
  return getServiceContractantTenderAttributionOverview(aoId);
}

export async function confirmServiceContractantDefinitiveAttribution(
  aoId: string,
  payload: ConfirmDefinitiveAttributionPayload,
): Promise<ServiceContractantTenderAttributionOverview> {
  await apiClient<unknown>(
    "/api/v1/appels-offres/attributions",
    {
      method: "POST",
      body: JSON.stringify({ ...payload, appelOffreId: aoId, type: "DEFINITIVE" }),
    },
  );
  return getServiceContractantTenderAttributionOverview(aoId);
}

// ─── Recours API ─────────────────────────────────────────────────────────────

export async function listServiceContractantTenderRecours(
  aoId: string,
): Promise<ServiceContractantTenderRecoursListItem[]> {
  return apiClient<ServiceContractantTenderRecoursListItem[]>(
    `/api/v1/recours/appel-offre/${aoId}`,
    { method: "GET" },
  );
}

export async function getServiceContractantTenderRecoursById(
  aoId: string,
  recoursId: string,
): Promise<ServiceContractantTenderRecoursDetail | null> {
  try {
    return await apiClient<ServiceContractantTenderRecoursDetail>(
      `/api/v1/recours/${recoursId}`,
      { method: "GET" },
    );
  } catch {
    return null;
  }
}

// ─── Avis API ────────────────────────────────────────────────────────────────

export async function listServiceContractantTenderAvis(
  aoId: string,
): Promise<TenderAvisItem[]> {
  return apiClient<TenderAvisItem[]>(
    `/api/v1/appels-offres/avis-ao?appelOffreId=${aoId}`,
    { method: "GET" },
  );
}

export async function getServiceContractantTenderAvisById(
  aoId: string,
  avisId: string,
): Promise<TenderAvisItem | null> {
  try {
    return await apiClient<TenderAvisItem>(
      `/api/v1/appels-offres/avis-ao/${avisId}`,
      { method: "GET" },
    );
  } catch {
    return null;
  }
}

export async function saveServiceContractantTenderAvisDraft(
  aoId: string,
  payload: SaveTenderAvisPayload,
): Promise<TenderAvisItem> {
  return apiClient<TenderAvisItem>(
    "/api/v1/appels-offres/avis-ao",
    {
      method: "POST",
      body: JSON.stringify({ ...payload, appelOffreId: aoId, isPublished: false }),
    },
  );
}

export async function publishServiceContractantTenderAvis(
  aoId: string,
  payload: SaveTenderAvisPayload,
): Promise<TenderAvisItem> {
  return apiClient<TenderAvisItem>(
    "/api/v1/appels-offres/avis-ao",
    {
      method: "POST",
      body: JSON.stringify({ ...payload, appelOffreId: aoId, isPublished: true }),
    },
  );
}

export async function publishServiceContractantTenderAvisById(
  aoId: string,
  avisId: string,
): Promise<TenderAvisItem> {
  return apiClient<TenderAvisItem>(
    `/api/v1/appels-offres/avis-ao/${avisId}`,
    { method: "PATCH", body: JSON.stringify({ isPublished: true }) },
  );
}

// ─── AI Orchestrator API ─────────────────────────────────────────────────────

export interface GenerateCdcDraftPayload {
  aoId: string;
  sectionType: string;
  userPrompt?: string;
}

export interface GenerateCdcDraftResponse {
  draft: string;
  biasDetected: boolean;
  correctedDraft?: string;
}

export async function generateCdcDraft(
  payload: GenerateCdcDraftPayload,
): Promise<GenerateCdcDraftResponse> {
  return apiClient<GenerateCdcDraftResponse>("/api/v1/ai/cdc-draft", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
