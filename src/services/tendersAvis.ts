export type TenderAvisType =
  | "ao"
  | "attribution_provisoire"
  | "attribution_definitive"
  | "annulation"
  | "rectificatif";

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

const API_BASE_URL = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "");
const USE_REAL_API = typeof window !== "undefined" || Boolean(process.env.NEXT_PUBLIC_API_BASE_URL);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const avisStore = new Map<string, TenderAvisItem[]>();

function seedAvisForAo(aoId: string) {
  const existing = avisStore.get(aoId);
  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();
  const seeded: TenderAvisItem[] = [
    {
      id: `AVIS-${aoId}-001`,
      aoId,
      type: "ao",
      title: "Avis d'appel d'offres initial",
      content:
        "<p>Avis de lancement de la consultation selon le cahier des charges valide.</p>",
      support: "plateforme",
      publicationDate: "2026-03-10",
      publicationEndDate: "2026-03-20",
      isPublished: true,
      status: "publie",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `AVIS-${aoId}-002`,
      aoId,
      type: "rectificatif",
      title: "Rectificatif delai de remise",
      content:
        "<p>Le delai de remise des offres est proroge de 5 jours ouvrables.</p>",
      support: "bomop",
      publicationDate: "2026-03-15",
      publicationEndDate: "2026-03-25",
      isPublished: false,
      status: "brouillon",
      createdAt: now,
      updatedAt: now,
    },
  ];

  avisStore.set(aoId, seeded);
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

export async function listServiceContractantTenderAvis(
  aoId: string,
): Promise<TenderAvisItem[]> {
  if (USE_REAL_API) {
    const all = await requestJson<any[]>(`/api/v1/appels-offres/avis-ao`, {
      method: "GET",
    });
    // Filter by aoId client-side since backend doesn't support filter
    const filtered = (Array.isArray(all) ? all : []).filter((item) => item.aoId === aoId);
    return filtered.map((item) => mapBackendAvisToFrontend(item, aoId));
  }

  await sleep(200);
  return [...seedAvisForAo(aoId)];
}

export async function getServiceContractantTenderAvisById(
  aoId: string,
  avisId: string,
): Promise<TenderAvisItem | null> {
  if (USE_REAL_API) {
    try {
      return await requestJson<TenderAvisItem>(
        `/api/v1/appels-offres/avis-ao/${avisId}`,
        {
          method: "GET",
        },
      );
    } catch {
      return null;
    }
  }

  await sleep(120);
  const avis = seedAvisForAo(aoId).find((item) => item.id === avisId);
  return avis || null;
}

export async function saveServiceContractantTenderAvisDraft(
  aoId: string,
  payload: SaveTenderAvisPayload,
): Promise<TenderAvisItem> {
  if (USE_REAL_API) {
    const mapped = mapAvisPayloadToBackend(aoId, payload, false);
    const result = await requestJson<any>(`/api/v1/appels-offres/avis-ao`, {
      method: "POST",
      body: JSON.stringify(mapped),
    });
    return mapBackendAvisToFrontend(result, aoId);
  }

  await sleep(260);
  const list = seedAvisForAo(aoId);
  const now = new Date().toISOString();
  const next: TenderAvisItem = {
    id: `AVIS-${aoId}-${Math.floor(1000 + Math.random() * 9000)}`,
    aoId,
    ...payload,
    isPublished: false,
    status: "brouillon",
    createdAt: now,
    updatedAt: now,
  };

  list.unshift(next);
  avisStore.set(aoId, list);
  return next;
}

export async function publishServiceContractantTenderAvis(
  aoId: string,
  payload: SaveTenderAvisPayload,
): Promise<TenderAvisItem> {
  if (USE_REAL_API) {
    const mapped = mapAvisPayloadToBackend(aoId, payload, true);
    const result = await requestJson<any>(
      `/api/v1/appels-offres/avis-ao`,
      {
        method: "POST",
        body: JSON.stringify(mapped),
      },
    );
    return mapBackendAvisToFrontend(result, aoId);
  }

  await sleep(280);
  const list = seedAvisForAo(aoId);
  const now = new Date().toISOString();
  const next: TenderAvisItem = {
    id: `AVIS-${aoId}-${Math.floor(1000 + Math.random() * 9000)}`,
    aoId,
    ...payload,
    isPublished: true,
    status: "publie",
    createdAt: now,
    updatedAt: now,
  };

  list.unshift(next);
  avisStore.set(aoId, list);
  return next;
}

export async function publishServiceContractantTenderAvisById(
  aoId: string,
  avisId: string,
): Promise<TenderAvisItem> {
  if (USE_REAL_API) {
    return requestJson<TenderAvisItem>(
      `/api/v1/appels-offres/avis-ao/${avisId}`,
      {
        method: "PATCH",
      },
    );
  }

  await sleep(200);
  const list = seedAvisForAo(aoId);
  const index = list.findIndex((item) => item.id === avisId);

  if (index < 0) {
    throw new Error("Avis introuvable");
  }

  const updated: TenderAvisItem = {
    ...list[index],
    isPublished: true,
    status: "publie",
    updatedAt: new Date().toISOString(),
  };
  list[index] = updated;
  avisStore.set(aoId, list);

  return updated;
}

// ─── Mapping helpers (frontend ↔ backend) ────────────────────────────────────

function mapTypeToBackend(type: TenderAvisType): string {
  switch (type) {
    case "ao": return "PUBLICATION";
    case "attribution_provisoire": return "ATTRIBUTION_PROV";
    case "attribution_definitive": return "ATTRIBUTION_DEF";
    case "annulation": return "ANNULATION";
    case "rectificatif": return "RECTIFICATIF";
    default: return "PUBLICATION";
  }
}

function mapTypeFromBackend(typeAvis: string): TenderAvisType {
  switch (typeAvis) {
    case "PUBLICATION": return "ao";
    case "ATTRIBUTION_PROV": return "attribution_provisoire";
    case "ATTRIBUTION_DEF": return "attribution_definitive";
    case "ANNULATION": return "annulation";
    case "RECTIFICATIF": return "rectificatif";
    default: return "ao";
  }
}

function mapAvisPayloadToBackend(aoId: string, payload: SaveTenderAvisPayload, publish: boolean) {
  return {
    aoId,
    typeAvis: mapTypeToBackend(payload.type),
    contenuBomop: payload.content || payload.title || "Avis",
    datePublication: payload.publicationDate ? new Date(payload.publicationDate).toISOString() : new Date().toISOString(),
    publieBomop: publish && (payload.support === "bomop" || payload.support === "plateforme"),
    publiePresse: publish && payload.support === "presse",
  };
}

function mapBackendAvisToFrontend(item: any, aoId: string): TenderAvisItem {
  return {
    id: item.id || "",
    aoId: item.aoId || aoId,
    type: mapTypeFromBackend(item.typeAvis || "PUBLICATION"),
    title: item.contenuBomop?.substring(0, 60) || "Avis",
    content: item.contenuBomop || "",
    support: item.publiePresse ? "presse" : item.publieBomop ? "bomop" : "plateforme",
    publicationDate: item.datePublication || "",
    publicationEndDate: item.datePublication || "",
    isPublished: item.publieBomop || item.publiePresse || false,
    status: (item.publieBomop || item.publiePresse) ? "publie" : "brouillon",
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  };
}
