import { apiClient } from "@/services/client";

export type OeAoStatus =
  | "publie"
  | "en_cours"
  | "evaluation"
  | "attribue"
  | "annule"
  | "cloture";

export type OeAoType = "ouvert" | "restreint" | "gre_a_gre";

export type OeSubmissionStatus =
  | "brouillon"
  | "deposee"
  | "recue"
  | "evaluee"
  | "retenue"
  | "rejetee";

export interface OeAoLot {
  id: string;
  lotNumber: string;
  designation: string;
  estimatedAmount?: string;
}

export interface OeAoItem {
  id: string;
  reference: string;
  object: string;
  type: OeAoType;
  deadline: string;
  status: OeAoStatus;
  organizationName: string;
  wilaya: string;
  sector: string;
  estimatedAmount?: string;
  hasSubmission: boolean;
  submissionStatus?: OeSubmissionStatus;
  lots: OeAoLot[];
}

interface ApiEnvelope<T> {
  data?: T;
  success?: boolean;
  statusCode?: number;
}

interface PaginatedPayload<T> {
  data: T[];
}

interface AppelOffreLotRecord {
  id: string;
  numero?: string;
  designation?: string;
  montantEstime?: number | string;
}

interface AppelOffreRecord {
  id: string;
  reference?: string;
  objet?: string;
  typeProcedure?: string;
  dateLimiteSoumission?: string;
  statut?: string;
  wilaya?: string;
  secteurActivite?: string;
  montantEstime?: number | string;
  serviceContractantId?: string;
  organisationName?: string;
  lots?: AppelOffreLotRecord[];
}

interface SubmissionRecord {
  id: string;
  appelOffreId?: string;
  appel_offre_id?: string;
  statut?: string;
  status?: string;
  createdAt?: string;
  created_at?: string;
}

function unwrapEnvelope<T>(payload: unknown): T {
  if (!payload) return payload as T;
  if (typeof payload === "object") {
    const rec = payload as Record<string, unknown>;
    if (("success" in rec || "statusCode" in rec) && "data" in rec) {
      return rec.data as T;
    }
  }
  return payload as T;
}

function extractList<T>(payload: unknown): T[] {
  const unwrapped = unwrapEnvelope<unknown>(payload);
  if (Array.isArray(unwrapped)) return unwrapped as T[];
  
  if (unwrapped && typeof unwrapped === "object") {
    const rec = unwrapped as Record<string, unknown>;
    if (Array.isArray(rec.data)) return rec.data as T[];
    if (Array.isArray(rec.content)) return rec.content as T[];
    if (Array.isArray(rec.items)) return rec.items as T[];
    if (Array.isArray(rec.results)) return rec.results as T[];
    if (Array.isArray(rec.rows)) return rec.rows as T[];
  }
  return [];
}

function normalizeId(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  return value.trim().toLowerCase();
}

function formatAmount(value?: string | number | null): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const asNumber = Number(value);
  if (Number.isNaN(asNumber)) {
    return String(value);
  }

  return `${new Intl.NumberFormat("fr-DZ").format(asNumber)} DZD`;
}

function normalizeSubmissionStatus(value: unknown): OeSubmissionStatus {
  const raw = String(value ?? "").trim().toUpperCase();

  if (raw === "BROUILLON" || raw === "DRAFT") return "brouillon";
  if (raw === "DEPOSEE" || raw === "SOUMISE" || raw === "SUBMITTED") return "deposee";
  if (raw === "RECUE" || raw === "RECU" || raw === "RECEIVED") return "recue";
  if (raw === "EVALUEE" || raw === "EN_EVALUATION" || raw === "EVALUATED") return "evaluee";
  if (raw === "RETENUE" || raw === "ATTRIBUEE" || raw === "SELECTED") return "retenue";

  return "rejetee";
}

function normalizeAoType(value: unknown): OeAoType {
  const raw = String(value ?? "").trim().toUpperCase();

  if (raw.includes("RESTREINT")) return "restreint";
  if (raw.includes("GRE")) return "gre_a_gre";

  return "ouvert";
}

function normalizeAoStatus(value: unknown): OeAoStatus {
  const raw = String(value ?? "").trim().toUpperCase();

  if (raw === "PUBLIE") return "publie";
  if (raw === "EN_COURS" || raw === "OUVERTURE_PLIS") return "en_cours";
  if (raw === "EVALUATION") return "evaluation";
  if (raw === "ATTRIBUE") return "attribue";
  if (raw === "ANNULE") return "annule";

  return "cloture";
}

function getSubmissionAoId(item: SubmissionRecord): string | null {
  return normalizeId(item.appelOffreId || item.appel_offre_id || null);
}

function pickLatestSubmissionStatusByAo(
  submissions: SubmissionRecord[],
): Map<string, OeSubmissionStatus> {
  const perAo = new Map<string, { at: number; status: OeSubmissionStatus }>();

  submissions.forEach((item) => {
    const aoId = getSubmissionAoId(item);
    if (!aoId) {
      return;
    }

    const at = new Date(item.createdAt || item.created_at || 0).getTime() || 0;
    const nextStatus = normalizeSubmissionStatus(item.statut || item.status);

    const existing = perAo.get(aoId);
    if (!existing || at >= existing.at) {
      perAo.set(aoId, { at, status: nextStatus });
    }
  });

  return new Map(Array.from(perAo.entries()).map(([key, value]) => [key, value.status]));
}

function mapAoRecord(
  ao: AppelOffreRecord,
  submissionStatusByAoId: Map<string, OeSubmissionStatus>,
): OeAoItem {
  const normalizedAoId = normalizeId(ao.id);
  const submissionStatus = normalizedAoId
    ? submissionStatusByAoId.get(normalizedAoId)
    : undefined;

  const lots = (ao.lots || []).map((lot, index) => ({
    id: lot.id || `${ao.id}-lot-${index + 1}`,
    lotNumber: lot.numero || String(index + 1),
    designation: lot.designation || `Lot ${index + 1}`,
    estimatedAmount: formatAmount(lot.montantEstime),
  }));

  return {
    id: ao.id,
    reference: ao.reference || ao.id,
    object: ao.objet || "Objet non renseigne",
    type: normalizeAoType(ao.typeProcedure),
    deadline: ao.dateLimiteSoumission || new Date().toISOString(),
    status: normalizeAoStatus(ao.statut),
    organizationName: ao.organisationName || "Service contractant",
    wilaya: ao.wilaya || "N/A",
    sector: ao.secteurActivite || "N/A",
    estimatedAmount: formatAmount(ao.montantEstime),
    hasSubmission: Boolean(submissionStatus),
    submissionStatus,
    lots,
  };
}

async function listOwnSubmissions(): Promise<SubmissionRecord[]> {
  const payload = await apiClient<unknown>("/api/v1/soumissions?page=1&limit=500", {
    method: "GET",
  }).catch(() => []);

  return extractList<SubmissionRecord>(payload);
}

async function listAllAos(): Promise<AppelOffreRecord[]> {
  const payload = await apiClient<unknown>("/api/v1/appels-offres?page=1&limit=500", {
    method: "GET",
  });

  return extractList<AppelOffreRecord>(payload);
}

async function getAoById(id: string): Promise<AppelOffreRecord | null> {
  if (!id) {
    return null;
  }

  const payload = await apiClient<unknown>(`/api/v1/appels-offres/${id}`, {
    method: "GET",
  }).catch(() => null);

  if (!payload) {
    return null;
  }

  const ao = unwrapEnvelope<AppelOffreRecord>(payload);
  return ao?.id ? ao : null;
}

async function hydrateAosWithLots(aos: AppelOffreRecord[]): Promise<AppelOffreRecord[]> {
  const missingLots = aos.filter((ao) => !Array.isArray(ao.lots) || ao.lots.length === 0);
  if (!missingLots.length) {
    return aos;
  }

  const detailedById = new Map<string, AppelOffreRecord>();

  await Promise.all(missingLots.map(async (ao) => {
    const detailed = await getAoById(ao.id);
    if (detailed && Array.isArray(detailed.lots) && detailed.lots.length > 0) {
      detailedById.set(ao.id, detailed);
    }
  }));

  if (!detailedById.size) {
    return aos;
  }

  return aos.map((ao) => detailedById.get(ao.id) || ao);
}

export async function listOperateurAppelsOffres(): Promise<OeAoItem[]> {
  const [rawAos, submissions] = await Promise.all([
    listAllAos(),
    listOwnSubmissions(),
  ]);

  const aos = await hydrateAosWithLots(rawAos);

  const submissionStatusByAoId = pickLatestSubmissionStatusByAo(submissions);

  // Hide draft AOs from operator browsing.
  return aos
    .filter((ao) => String(ao.statut || "").toUpperCase() !== "BROUILLON")
    .map((ao) => mapAoRecord(ao, submissionStatusByAoId))
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
}

export async function getOperateurAppelOffreById(id: string): Promise<OeAoItem | null> {
  const [aoRaw, submissions] = await Promise.all([
    apiClient<unknown>(`/api/v1/appels-offres/${id}`, { method: "GET" }).catch(() => null),
    listOwnSubmissions(),
  ]);

  if (!aoRaw) {
    return null;
  }

  const ao = unwrapEnvelope<AppelOffreRecord>(aoRaw);
  if (!ao || !ao.id) {
    return null;
  }

  const submissionStatusByAoId = pickLatestSubmissionStatusByAo(submissions);
  return mapAoRecord(ao, submissionStatusByAoId);
}

// ─── Eligibility Criteria & Documents ────────────────────────────────────────

export interface OeAoEligibilityCriterion {
  id: string;
  label: string;
  description?: string;
  isRequired: boolean;
}

export interface OeAoDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export async function getOperateurAoEligibilityCriteria(aoId: string): Promise<OeAoEligibilityCriterion[]> {
  const raw = await apiClient<unknown>(
    `/api/v1/appels-offres/${aoId}/criteres-eligibilite`,
    { method: "GET" },
  ).catch(() => []);

  const items = unwrapEnvelope<unknown>(raw);
  return Array.isArray(items) ? items as OeAoEligibilityCriterion[] : [];
}

export async function getOperateurAoDocuments(aoId: string): Promise<OeAoDocument[]> {
  const raw = await apiClient<unknown>(
    `/api/v1/documents/administrative/${aoId}`,
    { method: "GET" },
  ).catch(() => []);

  const items = unwrapEnvelope<unknown>(raw);
  return Array.isArray(items) ? items as OeAoDocument[] : [];
}
