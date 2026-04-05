export type TenderSubmissionStatus =
  | "recue"
  | "en_verification"
  | "technique_conforme"
  | "technique_non_conforme"
  | "retenue"
  | "rejetee";

export type TenderCautionStatus = "valid" | "expired" | "missing";

export type TenderTechnicalComplianceStatus =
  | "conforme"
  | "non_conforme"
  | "en_verification";

export type TenderAdministrativeDocumentStatus =
  | "valide"
  | "incomplet"
  | "rejete"
  | "en_attente";

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DEFAULT_MOCK_SUBMISSIONS: ServiceContractantTenderSubmissionDetail[] = [
  {
    id: "SOUM-001",
    reference: "SOUM-2026-001",
    operatorOrganizationName: "Sari TechSolutions",
    lotLabel: "LOT-01",
    submittedAt: "2026-03-10T09:45:00.000Z",
    withinDeadline: true,
    status: "technique_conforme",
    technicalOfferUploaded: true,
    cautionStatus: "valid",
    technicalOffer: {
      fileName: "offre-technique-sari.pdf",
      fileUrl: "/documents/soumissions/offre-technique-sari.pdf",
      sha256Hash:
        "3a7c62c6a6418e0c494cadf9b7beafe0f57242697543f6d95a7b90b8f8eb4cdd",
      complianceStatus: "conforme",
      observations:
        "Dossier technique complet avec methodologie detaillee et planning conforme.",
    },
    financialOffer: {
      amountHt: "38 000 000",
      amountTtc: "45 220 000",
      vatPercent: "19",
      decryptedAt: "2026-03-16T10:30:00.000Z",
    },
    caution: {
      amount: "1 200 000",
      bankName: "BEA",
      reference: "C-TS-2026-118",
      issueDate: "2026-03-02",
      expirationDate: "2026-08-30",
      status: "valid",
    },
    administrativeDocuments: [
      {
        id: "ADM-1",
        label: "Extrait registre de commerce",
        validationStatus: "valide",
      },
      {
        id: "ADM-2",
        label: "Attestation fiscale",
        validationStatus: "valide",
      },
      {
        id: "ADM-3",
        label: "CNAS/CASNOS",
        validationStatus: "en_attente",
        observations: "En cours de verification par la commission.",
      },
    ],
  },
  {
    id: "SOUM-002",
    reference: "SOUM-2026-002",
    operatorOrganizationName: "Global Network SA",
    lotLabel: "LOT-01",
    submittedAt: "2026-03-10T15:12:00.000Z",
    withinDeadline: true,
    status: "en_verification",
    technicalOfferUploaded: true,
    cautionStatus: "expired",
    technicalOffer: {
      fileName: "offre-technique-global.pdf",
      fileUrl: "/documents/soumissions/offre-technique-global.pdf",
      sha256Hash:
        "fc1f4b59ecf44ca9f7ea2e08d4dc35d531f4af72109b86a950f3db280b10297f",
      complianceStatus: "en_verification",
      observations:
        "Des eclaircissements ont ete demandes sur la capacite de livraison.",
    },
    financialOffer: {
      amountHt: "39 200 000",
      amountTtc: "46 648 000",
      vatPercent: "19",
      decryptedAt: null,
    },
    caution: {
      amount: "1 200 000",
      bankName: "CPA",
      reference: "C-GN-2026-087",
      issueDate: "2025-09-05",
      expirationDate: "2026-03-09",
      status: "expired",
    },
    administrativeDocuments: [
      {
        id: "ADM-1",
        label: "Extrait registre de commerce",
        validationStatus: "valide",
      },
      {
        id: "ADM-2",
        label: "Attestation fiscale",
        validationStatus: "incomplet",
        observations: "Version scannee illisible, nouveau fichier exige.",
      },
      {
        id: "ADM-3",
        label: "CNAS/CASNOS",
        validationStatus: "valide",
      },
    ],
  },
  {
    id: "SOUM-003",
    reference: "SOUM-2026-003",
    operatorOrganizationName: "Micro Systems",
    lotLabel: "LOT-02",
    submittedAt: "2026-03-11T08:30:00.000Z",
    withinDeadline: false,
    status: "rejetee",
    technicalOfferUploaded: false,
    cautionStatus: "missing",
    technicalOffer: {
      fileName: "-",
      fileUrl: "#",
      sha256Hash: "-",
      complianceStatus: "non_conforme",
      observations: "Offre technique absente au moment du depot.",
    },
    financialOffer: {
      amountHt: "0",
      amountTtc: "0",
      vatPercent: "19",
      decryptedAt: null,
    },
    caution: {
      amount: "0",
      bankName: "-",
      reference: "-",
      issueDate: "-",
      expirationDate: "-",
      status: "missing",
    },
    administrativeDocuments: [
      {
        id: "ADM-1",
        label: "Extrait registre de commerce",
        validationStatus: "rejete",
        observations: "Piece manquante dans le dossier recu.",
      },
      {
        id: "ADM-2",
        label: "Attestation fiscale",
        validationStatus: "rejete",
      },
    ],
  },
];

const mockSubmissionStore = new Map<
  string,
  ServiceContractantTenderSubmissionDetail[]
>();

function cloneDetail(
  item: ServiceContractantTenderSubmissionDetail,
): ServiceContractantTenderSubmissionDetail {
  return {
    ...item,
    technicalOffer: { ...item.technicalOffer },
    financialOffer: { ...item.financialOffer },
    caution: { ...item.caution },
    administrativeDocuments: item.administrativeDocuments.map((doc) => ({
      ...doc,
    })),
  };
}

function ensureMockSubmissions(
  aoId: string,
): ServiceContractantTenderSubmissionDetail[] {
  const existing = mockSubmissionStore.get(aoId);
  if (existing) {
    return existing;
  }

  const seeded = DEFAULT_MOCK_SUBMISSIONS.map((item) => ({
    ...cloneDetail(item),
    id: `${aoId}-${item.id}`,
  }));

  mockSubmissionStore.set(aoId, seeded);
  return seeded;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("API base URL is not configured");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
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

  return (await response.json()) as T;
}

export async function listServiceContractantTenderSubmissions(
  aoId: string,
): Promise<ServiceContractantTenderSubmissionListItem[]> {
  if (API_BASE_URL) {
    return requestJson<ServiceContractantTenderSubmissionListItem[]>(
      `/service-contractant/tenders/${aoId}/submissions`,
      {
        method: "GET",
      },
    );
  }

  await sleep(200);

  return ensureMockSubmissions(aoId).map((item) => ({
    id: item.id,
    reference: item.reference,
    operatorOrganizationName: item.operatorOrganizationName,
    lotLabel: item.lotLabel,
    submittedAt: item.submittedAt,
    withinDeadline: item.withinDeadline,
    status: item.status,
    technicalOfferUploaded: item.technicalOfferUploaded,
    cautionStatus: item.cautionStatus,
  }));
}

export async function getServiceContractantTenderSubmissionById(
  aoId: string,
  submissionId: string,
): Promise<ServiceContractantTenderSubmissionDetail | null> {
  if (API_BASE_URL) {
    try {
      return await requestJson<ServiceContractantTenderSubmissionDetail>(
        `/service-contractant/tenders/${aoId}/submissions/${submissionId}`,
        {
          method: "GET",
        },
      );
    } catch {
      return null;
    }
  }

  await sleep(160);

  const item = ensureMockSubmissions(aoId).find(
    (entry) => entry.id === submissionId,
  );
  return item ? cloneDetail(item) : null;
}
