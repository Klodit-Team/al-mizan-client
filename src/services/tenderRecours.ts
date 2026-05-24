export type TenderRecoursStatus = "depose" | "en_examen" | "accepte" | "rejete";

export type TenderRecoursDecision = "accepte" | "rejete";

export interface TenderRecoursAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
}

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
  attachments: TenderRecoursAttachment[];
  decision: TenderRecoursDecision | null;
  decisionReason: string | null;
  decisionDate: string | null;
}

const API_BASE_URL = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "");
const USE_REAL_API = typeof window !== "undefined" || Boolean(process.env.NEXT_PUBLIC_API_BASE_URL);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const recoursStore = new Map<string, ServiceContractantTenderRecoursDetail[]>();

const DEFAULT_RECOURS: ServiceContractantTenderRecoursDetail[] = [
  {
    id: "REC-001",
    reference: "REC-2026-001",
    operatorName: "Global Network SA",
    submittedAt: "2026-03-21",
    responseDeadlineAt: "2026-03-31",
    status: "en_examen",
    reason:
      "Contestations sur la notation technique de l'offre, avec demande de relecture des criteres d'experience.",
    attachments: [
      {
        id: "PJ-1",
        fileName: "memoire-recours-global.pdf",
        fileUrl: "/documents/recours/memoire-recours-global.pdf",
      },
      {
        id: "PJ-2",
        fileName: "annexe-notation.xlsx",
        fileUrl: "/documents/recours/annexe-notation.xlsx",
      },
    ],
    decision: null,
    decisionReason: null,
    decisionDate: null,
  },
  {
    id: "REC-002",
    reference: "REC-2026-002",
    operatorName: "EURL Data Protect",
    submittedAt: "2026-03-18",
    responseDeadlineAt: "2026-03-28",
    status: "accepte",
    reason:
      "Recours sur l'interpretation d'un critere eliminatoire portant sur la conformite documentaire.",
    attachments: [
      {
        id: "PJ-1",
        fileName: "recours-data-protect.pdf",
        fileUrl: "/documents/recours/recours-data-protect.pdf",
      },
    ],
    decision: "accepte",
    decisionReason:
      "La commission a constate une erreur materielle dans le calcul du seuil eliminatoire.",
    decisionDate: "2026-03-25",
  },
  {
    id: "REC-003",
    reference: "REC-2026-003",
    operatorName: "Micro Systems",
    submittedAt: "2026-03-10",
    responseDeadlineAt: "2026-03-20",
    status: "rejete",
    reason:
      "Demande d'annulation du classement final pour non-prise en compte d'une attestation complementaire.",
    attachments: [],
    decision: "rejete",
    decisionReason:
      "Le document complementaire a ete fourni hors delai de recevabilite.",
    decisionDate: "2026-03-19",
  },
  {
    id: "REC-004",
    reference: "REC-2026-004",
    operatorName: "Sari TechSolutions",
    submittedAt: "2026-03-26",
    responseDeadlineAt: "2026-04-05",
    status: "depose",
    reason:
      "Demande de precision sur les motifs de retenue d'un coefficient correctif financier.",
    attachments: [
      {
        id: "PJ-1",
        fileName: "demande-precision-sari.pdf",
        fileUrl: "/documents/recours/demande-precision-sari.pdf",
      },
    ],
    decision: null,
    decisionReason: null,
    decisionDate: null,
  },
];

function cloneRecours(
  item: ServiceContractantTenderRecoursDetail,
): ServiceContractantTenderRecoursDetail {
  return {
    ...item,
    attachments: item.attachments.map((file) => ({ ...file })),
  };
}

function ensureRecours(aoId: string): ServiceContractantTenderRecoursDetail[] {
  const existing = recoursStore.get(aoId);
  if (existing) {
    return existing;
  }

  const seeded = DEFAULT_RECOURS.map((item) => ({
    ...cloneRecours(item),
    id: `${aoId}-${item.id}`,
  }));
  recoursStore.set(aoId, seeded);

  return seeded;
}

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

export async function listServiceContractantTenderRecours(
  aoId: string,
): Promise<ServiceContractantTenderRecoursListItem[]> {
  if (USE_REAL_API) {
    return requestJson<ServiceContractantTenderRecoursListItem[]>(
      `/api/v1/recours/appel-offre/${aoId}`,
      {
        method: "GET",
      },
    );
  }

  await sleep(180);
  return ensureRecours(aoId).map((item) => ({
    id: item.id,
    reference: item.reference,
    operatorName: item.operatorName,
    submittedAt: item.submittedAt,
    responseDeadlineAt: item.responseDeadlineAt,
    status: item.status,
  }));
}

export async function getServiceContractantTenderRecoursById(
  aoId: string,
  recoursId: string,
): Promise<ServiceContractantTenderRecoursDetail | null> {
  if (USE_REAL_API) {
    try {
      return await requestJson<ServiceContractantTenderRecoursDetail>(
        `/api/v1/recours/${recoursId}`,
        {
          method: "GET",
        },
      );
    } catch {
      return null;
    }
  }

  await sleep(150);
  const entry = ensureRecours(aoId).find((item) => item.id === recoursId);
  return entry ? cloneRecours(entry) : null;
}
