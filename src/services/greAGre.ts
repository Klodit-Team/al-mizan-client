export type GreAGreRequestStatus =
  | "brouillon"
  | "soumise"
  | "en_analyse_ia"
  | "acceptee"
  | "rejetee"
  | "en_revision";

export type GreAGreIaRecommendation =
  | "accepter"
  | "rejeter"
  | "demander_complements";

export type GreAGreControllerFinalDecision =
  | "accepter"
  | "rejeter"
  | "demander_complements";

export type GreAGreJustificationType =
  | "urgence"
  | "technique"
  | "economique"
  | "juridique"
  | "autre";

export interface GreAGreJustificationPayload {
  type: GreAGreJustificationType;
  description: string;
  fileName?: string;
  order: number;
}

export interface GreAGreIaAnalysis {
  scoreCompliance: number;
  recommendation: GreAGreIaRecommendation;
  justification: string;
  confidenceLevel: number;
  analysisDate: string;
}

export interface GreAGreControllerDecision {
  finalDecision: GreAGreControllerFinalDecision;
  reason: string;
  matchesIaRecommendation: boolean;
  decisionDate: string;
}

export interface SubmitGreAGreRequestPayload {
  reference: string;
  object: string;
  description: string;
  estimatedAmount: string;
  justifications: GreAGreJustificationPayload[];
}

export interface ServiceContractantGreAGreRequestItem {
  id: string;
  reference: string;
  object: string;
  estimatedAmount: string;
  status: GreAGreRequestStatus;
  submittedAt: string;
  iaComplianceScore: number | null;
}

export interface ServiceContractantGreAGreRequestDetail extends ServiceContractantGreAGreRequestItem {
  description: string;
  justifications: GreAGreJustificationPayload[];
  iaAnalysis: GreAGreIaAnalysis | null;
  controllerDecision: GreAGreControllerDecision | null;
}

const API_BASE_URL = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "");
const USE_REAL_API = typeof window !== "undefined" || Boolean(process.env.NEXT_PUBLIC_API_BASE_URL);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockedGreAGreRequests: ServiceContractantGreAGreRequestItem[] = [
  {
    id: "GAG-2026-001",
    reference: "GAG-2026-001",
    object: "Acquisition urgente de pieces de rechange electriques",
    estimatedAmount: "8 500 000",
    status: "soumise",
    submittedAt: "2026-03-11",
    iaComplianceScore: null,
  },
  {
    id: "GAG-2026-002",
    reference: "GAG-2026-002",
    object: "Maintenance corrective immediate des groupes froids",
    estimatedAmount: "12 300 000",
    status: "en_analyse_ia",
    submittedAt: "2026-03-12",
    iaComplianceScore: 82,
  },
  {
    id: "GAG-2026-003",
    reference: "GAG-2026-003",
    object: "Renouvellement licence securite SOC",
    estimatedAmount: "5 750 000",
    status: "acceptee",
    submittedAt: "2026-03-05",
    iaComplianceScore: 91,
  },
  {
    id: "GAG-2026-004",
    reference: "GAG-2026-004",
    object: "Location equipements chantier pour intervention rapide",
    estimatedAmount: "9 120 000",
    status: "rejetee",
    submittedAt: "2026-03-02",
    iaComplianceScore: 42,
  },
  {
    id: "GAG-2026-005",
    reference: "GAG-2026-005",
    object: "Approvisionnement en consommables critiques",
    estimatedAmount: "3 100 000",
    status: "en_revision",
    submittedAt: "2026-03-14",
    iaComplianceScore: 68,
  },
  {
    id: "GAG-2026-006",
    reference: "GAG-2026-006",
    object: "Prestation expertise technique specialisee",
    estimatedAmount: "6 870 000",
    status: "brouillon",
    submittedAt: "2026-03-15",
    iaComplianceScore: null,
  },
];

const mockedGreAGreRequestDetails = new Map<
  string,
  ServiceContractantGreAGreRequestDetail
>([
  [
    "GAG-2026-001",
    {
      ...mockedGreAGreRequests[0],
      description:
        "Demande exceptionnelle suite a une panne critique sur l'infrastructure electrique.",
      justifications: [
        {
          type: "urgence",
          description:
            "Risque d'interruption des services essentiels si l'approvisionnement est differe.",
          fileName: "constat-technique-001.pdf",
          order: 1,
        },
      ],
      iaAnalysis: null,
      controllerDecision: null,
    },
  ],
  [
    "GAG-2026-002",
    {
      ...mockedGreAGreRequests[1],
      description:
        "Maintenance corrective des installations thermiques pour limiter les pertes de production.",
      justifications: [
        {
          type: "technique",
          description:
            "Degradation rapide des groupes froids constatee par le service maintenance.",
          fileName: "rapport-maintenance-002.pdf",
          order: 1,
        },
        {
          type: "economique",
          description:
            "Le retard d'intervention augmente les couts d'exploitation de 18%.",
          fileName: "simulation-couts-002.xlsx",
          order: 2,
        },
      ],
      iaAnalysis: {
        scoreCompliance: 82,
        recommendation: "demander_complements",
        justification:
          "Le dossier est globalement coherent, mais des precisions sur les delais fournisseurs sont attendues.",
        confidenceLevel: 74,
        analysisDate: "2026-03-13T10:30:00.000Z",
      },
      controllerDecision: null,
    },
  ],
  [
    "GAG-2026-003",
    {
      ...mockedGreAGreRequests[2],
      description:
        "Renouvellement urgent des licences SOC pour maintenir la surveillance cyber continue.",
      justifications: [
        {
          type: "juridique",
          description:
            "Conformite reglementaire imposee par la politique nationale de cybersecurite.",
          fileName: "note-conformite-003.pdf",
          order: 1,
        },
      ],
      iaAnalysis: {
        scoreCompliance: 91,
        recommendation: "accepter",
        justification:
          "Le besoin est documente et les justifications contractuelles sont conformes.",
        confidenceLevel: 88,
        analysisDate: "2026-03-06T09:00:00.000Z",
      },
      controllerDecision: {
        finalDecision: "accepter",
        reason:
          "Decision validee apres verification des clauses contractuelles et du budget alloue.",
        matchesIaRecommendation: true,
        decisionDate: "2026-03-07T14:20:00.000Z",
      },
    },
  ],
  [
    "GAG-2026-004",
    {
      ...mockedGreAGreRequests[3],
      description:
        "Location ponctuelle d'equipements chantier pour reparation d'urgence.",
      justifications: [
        {
          type: "autre",
          description:
            "Demande emise sans comparatif suffisant des alternatives deja contractualisees.",
          fileName: "demande-initiale-004.pdf",
          order: 1,
        },
      ],
      iaAnalysis: {
        scoreCompliance: 42,
        recommendation: "rejeter",
        justification:
          "Le dossier ne justifie pas suffisamment l'impossibilite de recourir aux contrats cadres existants.",
        confidenceLevel: 81,
        analysisDate: "2026-03-03T11:40:00.000Z",
      },
      controllerDecision: {
        finalDecision: "rejeter",
        reason:
          "Absence de preuves sur l'urgence immediate et manque de pieces justificatives obligatoires.",
        matchesIaRecommendation: true,
        decisionDate: "2026-03-04T16:00:00.000Z",
      },
    },
  ],
  [
    "GAG-2026-005",
    {
      ...mockedGreAGreRequests[4],
      description:
        "Approvisionnement de consommables critiques dans le cadre d'une rupture de stock.",
      justifications: [
        {
          type: "urgence",
          description:
            "Risque de rupture de service au-dela de 72 heures selon le stock previsionnel.",
          fileName: "etat-stock-005.xlsx",
          order: 1,
        },
        {
          type: "economique",
          description:
            "Proposition tarifaire competitive validee par le service achats.",
          fileName: "comparatif-prix-005.pdf",
          order: 2,
        },
      ],
      iaAnalysis: {
        scoreCompliance: 68,
        recommendation: "demander_complements",
        justification:
          "Des elements budgetaires et la tracabilite des consultations precedentes sont incomplets.",
        confidenceLevel: 72,
        analysisDate: "2026-03-15T08:10:00.000Z",
      },
      controllerDecision: {
        finalDecision: "demander_complements",
        reason:
          "Le dossier doit etre complete avec l'avis technique signe et les preuves de consultation.",
        matchesIaRecommendation: true,
        decisionDate: "2026-03-16T13:15:00.000Z",
      },
    },
  ],
  [
    "GAG-2026-006",
    {
      ...mockedGreAGreRequests[5],
      description:
        "Appui d'expertise technique specialisee pour calibrage d'equipements sensibles.",
      justifications: [
        {
          type: "technique",
          description:
            "Competence interne indisponible pour intervention immediate.",
          fileName: "note-technique-006.docx",
          order: 1,
        },
      ],
      iaAnalysis: null,
      controllerDecision: null,
    },
  ],
]);

function cloneDetail(
  detail: ServiceContractantGreAGreRequestDetail,
): ServiceContractantGreAGreRequestDetail {
  return {
    ...detail,
    justifications: detail.justifications.map((item) => ({ ...item })),
    iaAnalysis: detail.iaAnalysis ? { ...detail.iaAnalysis } : null,
    controllerDecision: detail.controllerDecision
      ? { ...detail.controllerDecision }
      : null,
  };
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

export async function listServiceContractantGreAGreRequests(): Promise<
  ServiceContractantGreAGreRequestItem[]
> {
  if (USE_REAL_API) {
    const raw = await requestJson<{ id: string; reference?: string; objet?: string; montantEstime?: number | string; statut?: string; createdAt?: string }[]>(
      "/api/v1/appels-offres?typeProcedure=GRE_A_GRE&page=1&limit=100",
      { method: "GET" },
    );
    return (Array.isArray(raw) ? raw : []).map((ao) => ({
      id: ao.id,
      reference: ao.reference || ao.id,
      object: ao.objet || "",
      estimatedAmount: String(ao.montantEstime || "0"),
      status: mapAoStatusToGreAGre(ao.statut),
      submittedAt: ao.createdAt || new Date().toISOString(),
      iaComplianceScore: null,
    }));
  }

  await sleep(250);
  return [...mockedGreAGreRequests];
}

function mapAoStatusToGreAGre(statut?: string): GreAGreRequestStatus {
  const s = (statut || "").toUpperCase();
  if (s === "BROUILLON") return "brouillon";
  if (s === "PUBLIE" || s === "SOUMISE") return "soumise";
  if (s === "EN_COURS" || s === "EVALUATION") return "en_analyse_ia";
  if (s === "ATTRIBUE") return "acceptee";
  if (s === "ANNULE") return "rejetee";
  return "soumise";
}

export async function getServiceContractantGreAGreRequestById(
  id: string,
): Promise<ServiceContractantGreAGreRequestDetail | null> {
  if (USE_REAL_API) {
    try {
      return await requestJson<ServiceContractantGreAGreRequestDetail>(
        `/api/v1/appels-offres/${id}`,
        {
          method: "GET",
        },
      );
    } catch {
      return null;
    }
  }

  await sleep(120);
  const detail = mockedGreAGreRequestDetails.get(id);
  return detail ? cloneDetail(detail) : null;
}

export async function submitServiceContractantGreAGreRequest(
  payload: SubmitGreAGreRequestPayload,
): Promise<ServiceContractantGreAGreRequestDetail> {
  if (USE_REAL_API) {
    return requestJson<ServiceContractantGreAGreRequestDetail>(
      "/api/v1/appels-offres?typeProcedure=GRE_A_GRE&page=1&limit=100",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  }

  await sleep(320);

  const nextNumber = mockedGreAGreRequests.length + 1;
  const now = new Date();
  const year = now.getFullYear();
  const generatedId = `GAG-${year}-${String(nextNumber).padStart(3, "0")}`;
  const submittedAt = now.toISOString().slice(0, 10);

  const item: ServiceContractantGreAGreRequestItem = {
    id: generatedId,
    reference: payload.reference,
    object: payload.object,
    estimatedAmount: payload.estimatedAmount,
    status: "soumise",
    submittedAt,
    iaComplianceScore: null,
  };

  mockedGreAGreRequests.unshift(item);

  const detail: ServiceContractantGreAGreRequestDetail = {
    ...item,
    description: payload.description,
    justifications: [...payload.justifications],
    iaAnalysis: null,
    controllerDecision: null,
  };

  mockedGreAGreRequestDetails.set(item.id, detail);

  return cloneDetail(detail);
}

export async function resubmitServiceContractantGreAGreRequest(
  id: string,
  payload: SubmitGreAGreRequestPayload,
): Promise<ServiceContractantGreAGreRequestDetail> {
  if (USE_REAL_API) {
    return requestJson<ServiceContractantGreAGreRequestDetail>(
      `/api/v1/appels-offres/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );
  }

  await sleep(300);

  const existingIndex = mockedGreAGreRequests.findIndex(
    (item) => item.id === id,
  );
  if (existingIndex < 0) {
    throw new Error("Demande Gre a Gre introuvable");
  }

  const submittedAt = new Date().toISOString().slice(0, 10);
  const updatedItem: ServiceContractantGreAGreRequestItem = {
    ...mockedGreAGreRequests[existingIndex],
    reference: payload.reference,
    object: payload.object,
    estimatedAmount: payload.estimatedAmount,
    status: "soumise",
    submittedAt,
    iaComplianceScore: null,
  };
  mockedGreAGreRequests[existingIndex] = updatedItem;

  const updatedDetail: ServiceContractantGreAGreRequestDetail = {
    ...updatedItem,
    description: payload.description,
    justifications: [...payload.justifications].sort(
      (a, b) => a.order - b.order,
    ),
    iaAnalysis: null,
    controllerDecision: null,
  };
  mockedGreAGreRequestDetails.set(id, updatedDetail);

  return cloneDetail(updatedDetail);
}
