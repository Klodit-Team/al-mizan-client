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
const API_BASE_URL = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "");

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
  const raw = await requestJson<{ id: string; reference?: string; objet?: string; montantEstime?: number | string; statut?: string; createdAt?: string; demandeGreAGre?: { scoreConformite?: number } }[]>(
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
    iaComplianceScore: ao.demandeGreAGre?.scoreConformite ?? null,
  }));
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
  try {
    const raw = await requestJson<any>(`/api/v1/appels-offres/${id}`, {
      method: "GET",
    });

    if (!raw) return null;

    let iaAnalysis: GreAGreIaAnalysis | null = null;
    if (raw.demandeGreAGre && raw.demandeGreAGre.scoreConformite !== undefined) {
      iaAnalysis = {
        scoreCompliance: raw.demandeGreAGre.scoreConformite,
        recommendation: raw.demandeGreAGre.recommandationIa || "demander_complements",
        justification: raw.demandeGreAGre.justificationIa || "",
        confidenceLevel: raw.demandeGreAGre.confianceScore || 0,
        analysisDate: raw.demandeGreAGre.updatedAt || new Date().toISOString(),
      };
    }

    const justifications = raw.demandeGreAGre?.justifications || [];

    return {
      id: raw.id,
      reference: raw.reference || raw.id,
      object: raw.objet || "",
      estimatedAmount: String(raw.montantEstime || "0"),
      status: mapAoStatusToGreAGre(raw.statut),
      submittedAt: raw.createdAt || new Date().toISOString(),
      iaComplianceScore: raw.demandeGreAGre?.scoreConformite ?? null,
      description: raw.description || "",
      justifications,
      iaAnalysis,
      controllerDecision: null,
    };
  } catch {
    return null;
  }
}

export async function submitServiceContractantGreAGreRequest(
  payload: SubmitGreAGreRequestPayload,
): Promise<ServiceContractantGreAGreRequestDetail> {
  return requestJson<ServiceContractantGreAGreRequestDetail>(
    "/api/v1/appels-offres?typeProcedure=GRE_A_GRE",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function resubmitServiceContractantGreAGreRequest(
  id: string,
  payload: SubmitGreAGreRequestPayload,
): Promise<ServiceContractantGreAGreRequestDetail> {
  return requestJson<ServiceContractantGreAGreRequestDetail>(
    `/api/v1/appels-offres/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}
