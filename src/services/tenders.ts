import { apiClient } from "@/services/client";

export type ServiceContractantTenderType = "ouvert" | "restreint" | "gre_a_gre";
export type ServiceContractantTenderStatus =
  | "brouillon"
  | "publie"
  | "en_cours"
  | "evaluation"
  | "attribue"
  | "annule";

export interface ServiceContractantTenderItem {
  id: string;
  reference: string;
  object: string;
  type: ServiceContractantTenderType;
  deadline: string;
  status: ServiceContractantTenderStatus;
}

export interface ServiceContractantTenderLot {
  id: string;
  number: string;
  designation: string;
  amount: string;
  status?: string;
}

export interface ServiceContractantEligibilityCriterion {
  id: string;
  label: string;
  details: string;
  eliminatory: boolean;
}

export interface ServiceContractantEvaluationCriterion {
  id: string;
  label: string;
  category: "technique" | "financier";
  weight: number;
  eliminationScore?: number;
}

export interface ServiceContractantCdcDocument {
  id: string;
  documentId: string;
  withdrawalPrice: string;
  publishedAt: string;
}

export interface ServiceContractantTenderDetail extends ServiceContractantTenderItem {
  amount: string;
  wilaya: string;
  sector: string;
  publicationDate?: string;
  lots: ServiceContractantTenderLot[];
  eligibilityCriteria: ServiceContractantEligibilityCriterion[];
  evaluationCriteria: ServiceContractantEvaluationCriterion[];
  cdcDocuments: ServiceContractantCdcDocument[];
}

export interface TenderLotPayload {
  lotNumber: string;
  designation: string;
  description: string;
  estimatedAmount: string;
  delayDays: string;
}

export interface TenderCriterionPayload {
  order: number;
  designation: string;
  description: string;
  eliminatory: boolean;
}

export interface TenderEvaluationCriterionPayload {
  order: number;
  designation: string;
  type: "technique" | "financier";
  weighting: string;
  eliminationScore: string;
  lotAssignment: string;
}

export interface SaveTenderDraftPayload {
  id?: string;
  reference: string;
  object: string;
  description: string;
  marketType: string;
  procedureType: string;
  estimatedAmount: string;
  executionWilaya: string;
  executionDelayDays: string;
  submissionBondRequired: boolean;
  submissionBondAmount: string;
  dceDeadline: string;
  offerDeadline: string;
  openingDate: string;
  cdc: {
    title: string;
    version: string;
    withdrawalPrice: string;
    isPublished: boolean;
    fileName?: string;
  };
  lots: TenderLotPayload[];
  eligibilityCriteria: TenderCriterionPayload[];
  evaluationCriteria: TenderEvaluationCriterionPayload[];
}

export interface PublishTenderPayload {
  id?: string;
  draft: SaveTenderDraftPayload;
  cdcFile?: File | null;
}

export interface ServiceContractantTenderDraft extends SaveTenderDraftPayload {
  id: string;
}

export interface TenderMutationResult {
  id: string;
  reference: string;
  status: ServiceContractantTenderStatus;
  avisReference?: string;
}

export type ServiceContractantApiStatus =
  | "BROUILLON"
  | "PUBLIE"
  | "EN_COURS"
  | "OUVERTURE_PLIS"
  | "EVALUATION"
  | "ATTRIBUE"
  | "ANNULE"
  | "CLOTURE";

interface ApiEnvelope<T> {
  data?: T;
  success?: boolean;
  statusCode?: number;
}

interface PaginatedPayload<T> {
  data: T[];
}

interface MePayload {
  user?: {
    userId?: string;
  };
}

interface ContractantIdentity {
  userId: string | null;
  serviceContractantId: string | null;
}

interface ServiceContractantRecord {
  id: string;
  userId?: string;
  user_id?: string;
}

interface AppelOffreRecord {
  id: string;
  reference?: string;
  objet?: string;
  typeProcedure?: string;
  montantEstime?: number | string;
  datePublication?: string;
  dateLimiteSoumission?: string;
  dateLimiteRetraitCdc?: string;
  statut?: string;
  serviceContractantId?: string;
  service_contractant_id?: string;
  wilaya?: string;
  secteurActivite?: string;
  lots?: Array<{
    id: string;
    numero?: string;
    designation?: string;
    montantEstime?: number | string;
    statut?: string;
  }>;
  criteresEligibilite?: Array<{
    id: string;
    libelle?: string;
    type?: string;
    valeurMinimale?: string;
    eliminatoire?: boolean;
  }>;
  criteresEvaluation?: Array<{
    id: string;
    libelle?: string;
    categorie?: string;
    poids?: number;
    noteEliminatoire?: number;
  }>;
  documentsCdc?: Array<{
    id: string;
    documentId?: string;
    prixRetrait?: number | string;
    publieAt?: string;
  }>;
}

function unwrapEnvelope<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in (payload as Record<string, unknown>) &&
    (
      "success" in (payload as Record<string, unknown>) ||
      "statusCode" in (payload as Record<string, unknown>)
    )
  ) {
    return (payload as ApiEnvelope<T>).data as T;
  }

  return payload as T;
}

function extractList<T>(payload: unknown): T[] {
  const unwrapped = unwrapEnvelope<unknown>(payload);

  if (Array.isArray(unwrapped)) {
    return unwrapped as T[];
  }

  if (
    unwrapped &&
    typeof unwrapped === "object" &&
    Array.isArray((unwrapped as PaginatedPayload<T>).data)
  ) {
    return (unwrapped as PaginatedPayload<T>).data;
  }

  return [];
}

function normalizeId(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  return value.trim().toLowerCase();
}

function mapTypeProcedureToUi(typeProcedure?: string): ServiceContractantTenderType {
  const raw = String(typeProcedure || "").trim().toUpperCase();

  if (raw === "AO_RESTREINT") {
    return "restreint";
  }

  if (raw === "GRE_A_GRE") {
    return "gre_a_gre";
  }

  return "ouvert";
}

function mapUiTypeToTypeProcedure(type: string): "AO_OUVERT" | "AO_RESTREINT" | "GRE_A_GRE" {
  const raw = String(type || "").trim().toLowerCase();

  if (raw === "restreint") {
    return "AO_RESTREINT";
  }

  if (raw === "gre_a_gre") {
    return "GRE_A_GRE";
  }

  return "AO_OUVERT";
}

function mapApiStatusToUi(statut?: string): ServiceContractantTenderStatus {
  const raw = String(statut || "").trim().toUpperCase();

  if (raw === "PUBLIE") return "publie";
  if (raw === "EN_COURS") return "en_cours";
  if (raw === "OUVERTURE_PLIS") return "en_cours";
  if (raw === "EVALUATION") return "evaluation";
  if (raw === "ATTRIBUE") return "attribue";
  if (raw === "ANNULE") return "annule";
  if (raw === "CLOTURE") return "attribue";

  return "brouillon";
}

function mapUiStatusToApi(statut: ServiceContractantTenderStatus):
  | "BROUILLON"
  | "PUBLIE"
  | "EN_COURS"
  | "EVALUATION"
  | "ATTRIBUE"
  | "ANNULE" {
  if (statut === "publie") return "PUBLIE";
  if (statut === "en_cours") return "EN_COURS";
  if (statut === "evaluation") return "EVALUATION";
  if (statut === "attribue") return "ATTRIBUE";
  if (statut === "annule") return "ANNULE";

  return "BROUILLON";
}

function mapRecordToTenderItem(record: AppelOffreRecord): ServiceContractantTenderItem {
  return {
    id: record.id,
    reference: record.reference || record.id,
    object: record.objet || "Objet non renseigne",
    type: mapTypeProcedureToUi(record.typeProcedure),
    deadline:
      record.dateLimiteSoumission ||
      new Date().toISOString(),
    status: mapApiStatusToUi(record.statut),
  };
}

function formatAmount(value?: number | string): string {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num) || num <= 0) {
    return "0 DZD";
  }

  return `${new Intl.NumberFormat("fr-DZ").format(num)} DZD`;
}

function toCriterionCategory(value?: string): "technique" | "financier" {
  const raw = String(value || "").trim().toUpperCase();
  return raw === "FINANCIER" ? "financier" : "technique";
}

function mapRecordToTenderDetail(record: AppelOffreRecord): ServiceContractantTenderDetail {
  return {
    ...mapRecordToTenderItem(record),
    amount: formatAmount(record.montantEstime),
    wilaya: record.wilaya || "-",
    sector: record.secteurActivite || "-",
    publicationDate: record.datePublication,
    lots: (record.lots || []).map((item, index) => ({
      id: item.id,
      number: item.numero || String(index + 1),
      designation: item.designation || `Lot ${index + 1}`,
      amount: formatAmount(item.montantEstime),
      status: item.statut,
    })),
    eligibilityCriteria: (record.criteresEligibilite || []).map((item) => ({
      id: item.id,
      label: item.libelle || "Critere",
      details:
        item.valeurMinimale && item.type
          ? `${item.type}: ${item.valeurMinimale}`
          : item.valeurMinimale || item.type || "Details non renseignes",
      eliminatory: Boolean(item.eliminatoire),
    })),
    evaluationCriteria: (record.criteresEvaluation || []).map((item) => ({
      id: item.id,
      label: item.libelle || "Critere",
      category: toCriterionCategory(item.categorie),
      weight: Number(item.poids ?? 0),
      eliminationScore:
        item.noteEliminatoire === undefined || item.noteEliminatoire === null
          ? undefined
          : Number(item.noteEliminatoire),
    })),
    cdcDocuments: (record.documentsCdc || []).map((item) => ({
      id: item.id,
      documentId: item.documentId || item.id,
      withdrawalPrice: formatAmount(item.prixRetrait),
      publishedAt: item.publieAt || "",
    })),
  };
}

function belongsToIdentity(record: AppelOffreRecord, identity: ContractantIdentity): boolean {
  const allowedOwnerIds = new Set(
    [identity.userId, identity.serviceContractantId]
      .map((value) => normalizeId(value))
      .filter((value): value is string => Boolean(value)),
  );

  if (allowedOwnerIds.size === 0) {
    return false;
  }

  const ownerId = normalizeId(record.serviceContractantId || record.service_contractant_id || null);
  return ownerId !== null && allowedOwnerIds.has(ownerId);
}

function parsePositiveNumber(input: string): number {
  const parsed = Number.parseFloat(String(input || "").replace(",", ".").trim());
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 1;
  }

  return parsed;
}

function asIsoDate(input: string): string {
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
}

async function resolveCurrentContractantIdentity(): Promise<ContractantIdentity> {
  const meRaw = await apiClient<unknown>("/api/v1/auth/me", { method: "GET" }).catch(() => null);
  const me = meRaw ? unwrapEnvelope<MePayload>(meRaw) : null;
  const userId = me?.user?.userId || null;

  if (!userId) {
      throw new Error("Session expirée. Veuillez rafraîchir la page et vous reconnecter.");
  }

  const listRaw = await apiClient<unknown>("/api/v1/users/services-contractants?page=1&limit=100", {
    method: "GET",
  }).catch(() => null);

  if (!listRaw) {
    return {
      userId,
      serviceContractantId: null,
    };
  }

  const normalizedUserId = normalizeId(userId);
  const list = extractList<ServiceContractantRecord>(listRaw);
  const current = list.find((item) => {
    const linkedUserId = normalizeId(item.userId || item.user_id || null);
    return normalizedUserId !== null && linkedUserId === normalizedUserId;
  });

  return {
    userId,
    serviceContractantId: current?.id || null,
  };
}

function buildCreateOrUpdatePayload(
  payload: SaveTenderDraftPayload,
  serviceContractantId: string,
) {
  return {
    reference: payload.reference,
    objet: payload.object,
    typeProcedure: mapUiTypeToTypeProcedure(payload.procedureType),
    montantEstime: parsePositiveNumber(payload.estimatedAmount),
    dateLimiteSoumission: asIsoDate(payload.offerDeadline),
    dateLimiteRetraitCdc: asIsoDate(payload.dceDeadline),
    serviceContractantId,
    wilaya: payload.executionWilaya || "Non renseigne",
    secteurActivite: payload.marketType || "Non renseigne",
  };
}

function mapProcedureType(value: string): ServiceContractantTenderItem["type"] {
  const raw = String(value || "").trim().toUpperCase();

  if (raw === "RESTREINT" || raw === "AO_RESTREINT") {
    return "restreint";
  }

  if (raw === "GRE_A_GRE") {
    return "gre_a_gre";
  }

  return "ouvert";
}

export async function listServiceContractantTenders(): Promise<
  ServiceContractantTenderItem[]
> {
  const [aosRaw, identity] = await Promise.all([
    apiClient<unknown>("/api/v1/appels-offres?page=1&limit=500", {
      method: "GET",
    }),
    resolveCurrentContractantIdentity(),
  ]);

  const rows = extractList<AppelOffreRecord>(aosRaw);
  return rows
    .filter((item) => belongsToIdentity(item, identity))
    .map(mapRecordToTenderItem)
    .sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime());
}

export async function getServiceContractantTenderById(
  id: string,
): Promise<ServiceContractantTenderDetail | null> {
  if (!id) {
    return null;
  }

  const [detailRaw, identity] = await Promise.all([
    apiClient<unknown>(`/api/v1/appels-offres/${id}`, { method: "GET" }).catch(() => null),
    resolveCurrentContractantIdentity(),
  ]);

  if (!detailRaw) {
    return null;
  }

  const record = unwrapEnvelope<AppelOffreRecord>(detailRaw);
  if (!record?.id) {
    return null;
  }

  if (!belongsToIdentity(record, identity)) {
    return null;
  }

  return mapRecordToTenderDetail(record);
}

export async function saveServiceContractantTenderDraft(
  payload: SaveTenderDraftPayload,
): Promise<TenderMutationResult> {
  const identity = await resolveCurrentContractantIdentity();
  const serviceContractantId = identity.serviceContractantId || identity.userId;
  if (!serviceContractantId) {
    throw new Error("Impossible de resoudre le service contractant courant.");
  }

  const requestBody = buildCreateOrUpdatePayload(payload, serviceContractantId);

  if (payload.id) {
    const updatedRaw = await apiClient<unknown>(`/api/v1/appels-offres/${payload.id}`, {
      method: "PATCH",
      body: JSON.stringify(requestBody),
    });

    const updated = unwrapEnvelope<AppelOffreRecord>(updatedRaw);
    return {
      id: updated.id,
      reference: updated.reference || payload.reference,
      status: mapApiStatusToUi(updated.statut || "BROUILLON"),
    };
  }

  const createdRaw = await apiClient<unknown>("/api/v1/appels-offres", {
    method: "POST",
    body: JSON.stringify(requestBody),
  });

  const created = unwrapEnvelope<AppelOffreRecord>(createdRaw);

  return {
    id: created.id,
    reference: created.reference || payload.reference,
    status: mapApiStatusToUi(created.statut || "BROUILLON"),
  };
}

export async function getServiceContractantTenderDraftById(
  id: string,
): Promise<ServiceContractantTenderDraft | null> {
  try {
    const aoRaw = await apiClient<unknown>(`/api/v1/appels-offres/${id}`, {
      method: "GET",
    });

    const ao = unwrapEnvelope<AppelOffreRecord>(aoRaw);
    if (!ao?.id) {
      return null;
    }

    return {
      id: ao.id,
      reference: ao.reference || ao.id,
      object: ao.objet || "",
      description: "",
      marketType: ao.secteurActivite || "",
      procedureType: mapProcedureType(ao.typeProcedure || ""),
      estimatedAmount: String(ao.montantEstime ?? ""),
      executionWilaya: ao.wilaya || "",
      executionDelayDays: "",
      submissionBondRequired: true,
      submissionBondAmount: "",
      dceDeadline: ao.dateLimiteRetraitCdc?.slice(0, 10) || "",
      offerDeadline: ao.dateLimiteSoumission?.slice(0, 10) || "",
      openingDate: ao.dateLimiteSoumission?.slice(0, 10) || "",
      cdc: {
        title: "",
        version: "v1.0.0",
        withdrawalPrice: "0.00",
        isPublished: false,
      },
      lots: (ao.lots ||[]).map((lot, idx) => ({ 
        lotNumber: lot.numero || String(idx + 1), 
        designation: lot.designation || "", 
        description: "", 
        estimatedAmount: String(lot.montantEstime || ""), 
        delayDays: "" 
      })),
      eligibilityCriteria: (ao.criteresEligibilite ||[]).map((c, idx) => ({ 
        order: idx + 1, 
        designation: c.libelle || "", 
        description: "", 
        eliminatory: c.eliminatoire || false 
      })),
      evaluationCriteria: (ao.criteresEvaluation || evaluationCriteria: (ao.criteresEvaluation || []).map((c, idx) => ({ 
        order: idx + 1, 
        designation: c.libelle || "", 
        type: String(c.categorie).toUpperCase() === "FINANCIER" ? "financier" : "technique", 
        weighting: String(c.poids || ""), 
        eliminationScore: String(c.noteEliminatoire || ""), 
        lotAssignment: "" 
      })),
    };
  } catch {
    return null;
  }
}

export async function publishServiceContractantTender(
  payload: PublishTenderPayload,
): Promise<TenderMutationResult> {
  const persisted = await saveServiceContractantTenderDraft({
    ...payload.draft,
    id: payload.id,
  });

  const aoId = persisted.id;

  // 1. Upload and link the CDC Document
  if (payload.cdcFile) {
    const formData = new FormData();
    formData.append("file", payload.cdcFile);
    formData.append("fichier", payload.cdcFile);
    try {
      const uploadRaw = await apiClient<any>("/api/v1/documents/upload", {
        method: "POST",
        body: formData,
      });
      const uploaded = unwrapEnvelope<any>(uploadRaw);
      const documentId = uploaded?.id || uploaded?.documentId;
      if (documentId) {
        await apiClient(`/api/v1/appels-offres/${aoId}/cdc`, {
          method: "POST",
          body: JSON.stringify({
            documentId,
            prixRetrait: parsePositiveNumber(payload.draft.cdc.withdrawalPrice || "0")
          })
        });
      }
    } catch (err) {
      console.warn("Failed to upload CDC:", err);
    }
  }

  // 2. Save Lots
  for (const lot of payload.draft.lots || []) {
    await apiClient(`/api/v1/appels-offres/${aoId}/lots`, {
      method: "POST",
      body: JSON.stringify({
        numero: lot.lotNumber,
        designation: lot.designation,
        montantEstime: parsePositiveNumber(lot.estimatedAmount)
      }),
    }).catch((err) => console.warn("Failed to save lot:", err));
  }

  // 3. Save Eligibility Criteria
  for (const crit of payload.draft.eligibilityCriteria || []) {
    await apiClient(`/api/v1/appels-offres/${aoId}/criteres-eligibilite`, {
      method: "POST",
      body: JSON.stringify({
        libelle: crit.designation,
        type: "EXPERIENCE",
        valeurMinimale: crit.description || "N/A",
      }),
    }).catch((err) => console.warn("Failed to save eligibility:", err));
  }

  // 4. Save Evaluation Criteria
  for (const evalCrit of payload.draft.evaluationCriteria || []) {
    await apiClient(`/api/v1/appels-offres/${aoId}/criteres-evaluation`, {
      method: "POST",
      body: JSON.stringify({
        libelle: evalCrit.designation,
        categorie: evalCrit.type === "financier" ? "FINANCIER" : "TECHNIQUE",
        poids: parsePositiveNumber(evalCrit.weighting),
      }),
    }).catch((err) => console.warn("Failed to save evaluation:", err));
  }

  // 5. Change status to PUBLIE
  await apiClient<unknown>(`/api/v1/appels-offres/${aoId}/statut`, {
    method: "PATCH",
    body: JSON.stringify({ statut: "PUBLIE" }),
  });

  return {
    id: aoId,
    reference: persisted.reference,
    status: "publie",
  };
}

export async function toggleServiceContractantTenderStatus(
  id: string,
): Promise<ServiceContractantTenderStatus> {
  const aoRaw = await apiClient<unknown>(`/api/v1/appels-offres/${id}`, {
    method: "GET",
  });
  const ao = unwrapEnvelope<AppelOffreRecord>(aoRaw);
  const current = mapApiStatusToUi(ao.statut);

  const next: ServiceContractantTenderStatus =
    current === "publie" ? "en_cours" : current === "en_cours" ? "publie" : current;

  if (next === current) {
    return current;
  }

  await apiClient<unknown>(`/api/v1/appels-offres/${id}/statut`, {
    method: "PATCH",
    body: JSON.stringify({ statut: mapUiStatusToApi(next) }),
  });

  return next;
}

export async function updateServiceContractantTenderStatus(
  id: string,
  statut: ServiceContractantApiStatus,
): Promise<ServiceContractantTenderStatus> {
  await apiClient<unknown>(`/api/v1/appels-offres/${id}/statut`, {
    method: "PATCH",
    body: JSON.stringify({ statut }),
  });

  return mapApiStatusToUi(statut);
}

export async function deleteServiceContractantTender(id: string): Promise<void> {
  await apiClient<void>(`/api/v1/appels-offres/${id}`, {
    method: "DELETE",
  });
}
