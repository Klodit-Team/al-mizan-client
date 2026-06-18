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

const API_BASE_URL = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://api-gateway:3000");

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
  if (json && typeof json === "object") {
    if ("success" in json && "data" in json) {
      const inner = json.data;
      if (inner && typeof inner === "object" && "data" in inner && Array.isArray(inner.data)) {
        return inner.data as T;
      }
      return inner as T;
    }
    if ("data" in json && Array.isArray(json.data)) return json.data as T;
  }

  return json as T;
}

export async function listServiceContractantGreAGreRequests(): Promise<
  ServiceContractantGreAGreRequestItem[]
> {
  const raw = await requestJson<{ id: string; reference?: string; objet?: string; montantEstime?: number | string; statut?: string; createdAt?: string; demandeGreAGre?: any }[]>(
    "/api/v1/appels-offres?typeProcedure=GRE_A_GRE&page=1&limit=100",
    { method: "GET" },
  );
  return (Array.isArray(raw) ? raw : []).map((ao) => {
    let status = "brouillon";
    if (ao.demandeGreAGre && ao.demandeGreAGre.statut) {
      status = ao.demandeGreAGre.statut.toLowerCase();
    } else {
      status = mapAoStatusToGreAGre(ao.statut);
    }

    const score = ao.demandeGreAGre?.evaluationsIa?.[0]?.scoreConformite;

    return {
      id: ao.id,
      reference: ao.reference || ao.id,
      object: ao.objet || "",
      estimatedAmount: String(ao.montantEstime || "0"),
      status: status as GreAGreRequestStatus,
      submittedAt: ao.createdAt || new Date().toISOString(),
      iaComplianceScore: score !== undefined ? Number(score) : null,
    };
  });
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
  token?: string
): Promise<ServiceContractantGreAGreRequestDetail | null> {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Cookie = `access_token=${token}`;
    }

    const raw = await requestJson<any>(`/api/v1/appels-offres/${id}`, {
      method: "GET",
      headers,
    });

    if (!raw) return null;

    let iaAnalysis: GreAGreIaAnalysis | null = null;
    const derniereEval = raw.demandeGreAGre?.evaluationsIa?.[0];
    if (derniereEval && derniereEval.scoreConformite !== undefined) {
      let recStr = String(derniereEval.recommandation).toLowerCase();
      if (recStr === "accepter" || recStr === "rejeter" || recStr === "demander_complements") {
        // valid
      } else {
        recStr = "demander_complements";
      }

      iaAnalysis = {
        scoreCompliance: Number(derniereEval.scoreConformite),
        recommendation: recStr as GreAGreIaRecommendation,
        justification: derniereEval.justificationIa || "",
        confidenceLevel: Number(derniereEval.confianceScore),
        analysisDate: derniereEval.dateAnalyse || derniereEval.createdAt || new Date().toISOString(),
      };
    }

    let controllerDecision: GreAGreControllerDecision | null = null;
    const derniereDecision = raw.demandeGreAGre?.decisions?.[0];
    if (derniereDecision) {
      let decStr = String(derniereDecision.decisionFinale).toLowerCase();
      if (decStr !== "accepter" && decStr !== "rejeter" && decStr !== "demander_complements") {
        decStr = "demander_complements";
      }
      controllerDecision = {
        finalDecision: decStr as GreAGreControllerFinalDecision,
        reason: derniereDecision.motifDecision || "",
        matchesIaRecommendation: Boolean(derniereDecision.correspondIa),
        decisionDate: derniereDecision.dateDecision || derniereDecision.createdAt || new Date().toISOString(),
      };
    }

    const rawJustifs = raw.demandeGreAGre?.justifications || [];
    const justifications = rawJustifs.map((j: any) => ({
      type: String(j.typeJustification).toLowerCase(),
      description: j.description,
      fileName: j.documentId,
      order: j.ordre,
    }));

    // Status: prefer demandeGreAGre.statut, otherwise mapped AO statut
    let status = "brouillon";
    if (raw.demandeGreAGre && raw.demandeGreAGre.statut) {
      status = raw.demandeGreAGre.statut.toLowerCase();
    } else {
      status = mapAoStatusToGreAGre(raw.statut);
    }

    return {
      id: raw.id,
      reference: raw.reference || raw.id,
      object: raw.objet || "",
      estimatedAmount: String(raw.montantEstime || "0"),
      status: status as GreAGreRequestStatus,
      submittedAt: raw.createdAt || new Date().toISOString(),
      iaComplianceScore: iaAnalysis?.scoreCompliance ?? null,
      description: raw.description || "",
      justifications,
      iaAnalysis,
      controllerDecision,
    };
  } catch {
    return null;
  }
}

export async function submitServiceContractantGreAGreRequest(
  payload: SubmitGreAGreRequestPayload,
): Promise<ServiceContractantGreAGreRequestDetail> {
  // 1. Fetch user ID to set serviceContractantId
  const meRaw = await requestJson<any>("/api/v1/auth/me", { method: "GET" }).catch(() => null);
  const serviceContractantId = meRaw?.user?.userId || "00000000-0000-0000-0000-000000000000";

  // 2. Map payload to CreateAppelOffreDto required fields
  const createAppelOffrePayload = {
    reference: payload.reference,
    objet: payload.object,
    typeProcedure: "GRE_A_GRE",
    montantEstime: Number(payload.estimatedAmount) || 1,
    dateLimiteSoumission: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    dateLimiteRetraitCdc: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    wilaya: "Non spécifié",
    secteurActivite: "Non spécifié",
    serviceContractantId,
  };

  // 3. Create the Appel d'Offre
  const created = await requestJson<{ id: string }>(
    "/api/v1/appels-offres",
    {
      method: "POST",
      body: JSON.stringify(createAppelOffrePayload),
    },
  );

  // 4. Map justifications to the backend format
  const submitDto = {
    justifications: payload.justifications.map((j) => ({
      type_justification: j.type.toUpperCase(),
      description: j.description,
    })),
  };

  // 5. Submit the Gre-a-gre request
  await requestJson<any>(
    `/api/v1/appels-offres/${created.id}/gre-a-gre/soumettre`,
    {
      method: "POST",
      body: JSON.stringify(submitDto),
    },
  );

  const detail = await getServiceContractantGreAGreRequestById(created.id);
  if (!detail) throw new Error("Failed to retrieve created request");
  return detail;
}

export async function resubmitServiceContractantGreAGreRequest(
  id: string,
  payload: SubmitGreAGreRequestPayload,
): Promise<ServiceContractantGreAGreRequestDetail> {
  // 1. Map to UpdateAppelOffreDto
  const updateAppelOffrePayload = {
    reference: payload.reference,
    objet: payload.object,
    montantEstime: Number(payload.estimatedAmount) || 1,
  };

  // 2. Patch the existing AO
  await requestJson<any>(
    `/api/v1/appels-offres/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(updateAppelOffrePayload),
    },
  );

  // 3. Map justifications for resubmission
  const submitDto = {
    justifications: payload.justifications.map((j) => ({
      type_justification: j.type.toUpperCase(),
      description: j.description,
    })),
  };

  // 4. Resubmit the Gre-a-gre request
  await requestJson<any>(
    `/api/v1/appels-offres/${id}/gre-a-gre/soumettre`,
    {
      method: "POST",
      body: JSON.stringify(submitDto),
    },
  );

  const detail = await getServiceContractantGreAGreRequestById(id);
  if (!detail) throw new Error("Failed to retrieve resubmitted request");
  return detail;
}
