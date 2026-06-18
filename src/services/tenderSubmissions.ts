import { apiClient } from "@/services/client";

export type TenderSubmissionStatus = "recue" | "en_verification" | "technique_conforme" | "technique_non_conforme" | "retenue" | "rejetee";
export type TenderCautionStatus = "valid" | "expired" | "missing";
export type TenderTechnicalComplianceStatus = "conforme" | "non_conforme" | "en_verification";
export type TenderAdministrativeDocumentStatus = "valide" | "incomplet" | "rejete" | "en_attente";

export interface ServiceContractantTenderSubmissionListItem {
  id: string;
  reference: string;
  operatorOrganizationName: string;
  lotLabel?: string | null;
  submittedAt: string;
  withinDeadline: boolean;
  status: TenderSubmissionStatus;
  technicalOfferUploaded: boolean;
  cautionStatus: TenderCautionStatus;
}

export interface TenderSubmissionTechnicalOffer {
  fileName: string;
  fileUrl: string;
  sha256Hash: string;
  complianceStatus: TenderTechnicalComplianceStatus;
  observations: string;
}

export interface TenderSubmissionFinancialOffer {
  amountHt: string;
  amountTtc: string;
  vatPercent: string;
  decryptedAt: string | null;
}

export interface TenderSubmissionCaution {
  amount: string;
  bankName: string;
  reference: string;
  issueDate: string;
  expirationDate: string;
  status: TenderCautionStatus;
}

export interface TenderSubmissionAdministrativeDocument {
  id: string;
  label: string;
  validationStatus: TenderAdministrativeDocumentStatus;
  observations?: string;
}

export interface ServiceContractantTenderSubmissionDetail extends ServiceContractantTenderSubmissionListItem {
  technicalOffer: TenderSubmissionTechnicalOffer;
  financialOffer: TenderSubmissionFinancialOffer;
  caution: TenderSubmissionCaution;
  administrativeDocuments: TenderSubmissionAdministrativeDocument[];
}

const USE_REAL_API = true; // Forcing real API usage

// ─── Helpers ───────────────────────────────────────────────────────────

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiClient<unknown>(path, init).catch(() => null);
  if (!response) throw new Error("Request failed");
  
  if (response && typeof response === "object" && "data" in response && Array.isArray((response as any).data)) {
    return (response as any).data as T;
  }
  return response as T;
}

async function getOperateursMap() {
  try {
    const raw = await requestJson<any[]>("/api/v1/operateurs-economiques?page=1&limit=500", { method: "GET" }).catch(() => []);
    const list = Array.isArray(raw) ? raw : (raw as any)?.data || [];
    const map = new Map<string, string>();
    list.forEach(op => {
      map.set(op.userId, op.organisation?.denomination || op.organisationId || "Opérateur");
    });
    return map;
  } catch {
    return new Map<string, string>();
  }
}

function mapSoumissionStatus(statut?: string): TenderSubmissionStatus {
  const s = (statut || "").toUpperCase();
  if (s === "BROUILLON" || s === "DRAFT") return "recue";
  if (s === "DEPOSEE" || s === "SOUMISE" || s === "SUBMITTED") return "recue";
  if (s === "RECUE" || s === "RECEIVED") return "recue";
  if (s === "EN_VERIFICATION" || s === "VERIFICATION") return "en_verification";
  if (s === "TECHNIQUE_CONFORME" || s === "CONFORME") return "technique_conforme";
  if (s === "TECHNIQUE_NON_CONFORME" || s === "NON_CONFORME") return "technique_non_conforme";
  if (s === "RETENUE" || s === "ATTRIBUEE") return "retenue";
  if (s === "REJETEE" || s === "REJECTED") return "rejetee";
  return "recue";
}

// ─── API Functions ───────────────────────────────────────────────────────────

export async function listServiceContractantTenderSubmissions(
  aoId: string,
): Promise<ServiceContractantTenderSubmissionListItem[]> {
  const [raw, opMap] = await Promise.all([
     requestJson<any[]>(`/api/v1/soumissions/appel-offre/${aoId}`, { method: "GET" }).catch(() => []),
     getOperateursMap()
  ]);

  return (Array.isArray(raw) ? raw : []).map((item) => ({
    id: item.id,
    reference: item.reference || item.id,
    operatorOrganizationName: opMap.get(item.operateurId) || item.operateurNom || item.operateurId || "Opérateur",
    lotLabel: item.lotId ? `Lot ${item.lotId.substring(0, 8)}` : null,
    submittedAt: item.horodatageServeur || item.createdAt || "",
    withinDeadline: item.isDansDelai ?? true,
    status: mapSoumissionStatus(item.statut),
    technicalOfferUploaded: item.offreTechniqueId != null,
    cautionStatus: item.cautionId ? "valid" : "missing",
  }));
}

export async function getServiceContractantTenderSubmissionById(
  aoId: string,
  submissionId: string,
): Promise<ServiceContractantTenderSubmissionDetail | null> {
  try {
    const [raw, opMap] = await Promise.all([
      requestJson<any>(`/api/v1/soumissions/${submissionId}`, { method: "GET" }),
      getOperateursMap()
    ]);
    
    if (!raw || !raw.id) return null;
    
    return {
      id: raw.id,
      reference: raw.reference || raw.id,
      operatorOrganizationName: opMap.get(raw.operateurId) || raw.operateurNom || raw.operateurId || "Opérateur",
      lotLabel: raw.lotId ? `Lot` : null,
      submittedAt: raw.horodatageServeur || raw.createdAt || "",
      withinDeadline: raw.isDansDelai ?? true,
      status: mapSoumissionStatus(raw.statut),
      technicalOfferUploaded: raw.offreTechniqueId != null,
      cautionStatus: raw.cautionId ? "valid" : "missing",
      technicalOffer: raw.offreTechnique || { fileName: "-", fileUrl: "#", sha256Hash: "-", complianceStatus: "en_verification", observations: "" },
      financialOffer: raw.offreFinanciere || { amountHt: "0", amountTtc: "0", vatPercent: "19", decryptedAt: null },
      caution: raw.caution || { amount: "0", bankName: "-", reference: "-", issueDate: "-", expirationDate: "-", status: "missing" },
      administrativeDocuments: raw.documentsAdministratifs || [],
    };
  } catch {
    return null;
  }
}