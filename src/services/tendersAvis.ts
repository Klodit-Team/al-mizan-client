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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

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

export async function listServiceContractantTenderAvis(
  aoId: string,
): Promise<TenderAvisItem[]> {
  if (API_BASE_URL) {
    return requestJson<TenderAvisItem[]>(`/service-contractant/tenders/${aoId}/avis`, {
      method: "GET",
    });
  }

  await sleep(200);
  return [...seedAvisForAo(aoId)];
}

export async function getServiceContractantTenderAvisById(
  aoId: string,
  avisId: string,
): Promise<TenderAvisItem | null> {
  if (API_BASE_URL) {
    try {
      return await requestJson<TenderAvisItem>(
        `/service-contractant/tenders/${aoId}/avis/${avisId}`,
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
  if (API_BASE_URL) {
    return requestJson<TenderAvisItem>(`/service-contractant/tenders/${aoId}/avis`, {
      method: "POST",
      body: JSON.stringify({ ...payload, isPublished: false }),
    });
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
  if (API_BASE_URL) {
    return requestJson<TenderAvisItem>(
      `/service-contractant/tenders/${aoId}/avis/publish`,
      {
        method: "POST",
        body: JSON.stringify({ ...payload, isPublished: true }),
      },
    );
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
  if (API_BASE_URL) {
    return requestJson<TenderAvisItem>(
      `/service-contractant/tenders/${aoId}/avis/${avisId}/publish`,
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