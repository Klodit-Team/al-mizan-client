import { ApiClientError, apiClient } from "@/services/client";

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
  publieBomop: boolean;
  publiePresse: boolean;
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

interface BackendAvisAo {
  id: string;
  aoId: string;
  typeAvis: string;
  contenuBomop: string;
  datePublication: string;
  publieBomop: boolean;
  publiePresse: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const AVIS_AO_BASE = "/api/v1/appels-offres/avis-ao";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const avisStore = new Map<string, TenderAvisItem[]>();

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_AVIS === "true";

export function getTenderAvisErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) {
    return error.message || fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;

    if (Array.isArray(record.data)) {
      return record.data as T[];
    }

    if (
      record.data &&
      typeof record.data === "object" &&
      Array.isArray((record.data as Record<string, unknown>).items)
    ) {
      return (record.data as { items: T[] }).items;
    }
  }

  return [];
}

function unwrapItem<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

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
      publieBomop: true,
      publiePresse: false,
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
      publieBomop: false,
      publiePresse: false,
      createdAt: now,
      updatedAt: now,
    },
  ];

  avisStore.set(aoId, seeded);
  return seeded;
}

function mapTypeToBackend(type: TenderAvisType): string {
  switch (type) {
    case "ao":
      return "PUBLICATION";
    case "attribution_provisoire":
      return "ATTRIBUTION_PROV";
    case "attribution_definitive":
      return "ATTRIBUTION_DEF";
    case "annulation":
      return "ANNULATION";
    case "rectificatif":
      return "RECTIFICATIF";
    default:
      return "PUBLICATION";
  }
}

function mapTypeFromBackend(typeAvis: string): TenderAvisType {
  switch (typeAvis) {
    case "PUBLICATION":
      return "ao";
    case "ATTRIBUTION_PROV":
      return "attribution_provisoire";
    case "ATTRIBUTION_DEF":
      return "attribution_definitive";
    case "ANNULATION":
      return "annulation";
    case "RECTIFICATIF":
      return "rectificatif";
    default:
      return "ao";
  }
}

function resolvePublicationFlags(support: TenderAvisSupport, publish: boolean) {
  if (!publish) {
    return { publieBomop: false, publiePresse: false };
  }

  return {
    publieBomop: support === "bomop" || support === "plateforme",
    publiePresse: support === "presse" || support === "plateforme",
  };
}

function mapSupportFromBackend(item: BackendAvisAo): TenderAvisSupport {
  if (item.publiePresse && item.publieBomop) {
    return "plateforme";
  }
  if (item.publiePresse) {
    return "presse";
  }
  if (item.publieBomop) {
    return "bomop";
  }
  return "plateforme";
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toBackendContent(payload: SaveTenderAvisPayload): string {
  const plainContent = stripHtml(payload.content);
  if (plainContent) {
    return plainContent;
  }
  return payload.title.trim() || "Avis";
}

function toBackendDate(dateValue: string): string {
  if (!dateValue) {
    return new Date().toISOString();
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return `${dateValue}T00:00:00.000Z`;
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
}

function mapAvisPayloadToBackend(
  aoId: string,
  payload: SaveTenderAvisPayload,
  publish: boolean,
) {
  return {
    aoId,
    typeAvis: mapTypeToBackend(payload.type),
    contenuBomop: toBackendContent(payload),
    datePublication: toBackendDate(payload.publicationDate),
    publieBomop: payload.support === "bomop" || payload.support === "plateforme",
    publiePresse: payload.support === "presse" || payload.support === "plateforme",
  };
}
function mapBackendAvisToFrontend(
  item: BackendAvisAo,
  aoId: string,
): TenderAvisItem {
  const isPublished = item.publieBomop || item.publiePresse;
  const content = item.contenuBomop || "";

  return {
    id: item.id || "",
    aoId: item.aoId || aoId,
    type: mapTypeFromBackend(item.typeAvis || "PUBLICATION"),
    title: content.substring(0, 60) || "Avis",
    content,
    support: mapSupportFromBackend(item),
    publicationDate: item.datePublication || "",
    publicationEndDate: item.datePublication || "",
    isPublished,
    status: isPublished ? "publie" : "brouillon",
    publieBomop: item.publieBomop ?? false,
    publiePresse: item.publiePresse ?? false,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  };
}

export async function listServiceContractantTenderAvis(
  aoId: string,
): Promise<TenderAvisItem[]> {
  if (USE_MOCK) {
    await sleep(200);
    return [...seedAvisForAo(aoId)];
  }

  const raw = await apiClient<unknown>(AVIS_AO_BASE, { method: "GET" });
  const all = unwrapList<BackendAvisAo>(raw);
  const filtered = all.filter((item) => item.aoId === aoId);
  return filtered.map((item) => mapBackendAvisToFrontend(item, aoId));
}

export async function getServiceContractantTenderAvisById(
  aoId: string,
  avisId: string,
): Promise<TenderAvisItem | null> {
  if (USE_MOCK) {
    await sleep(120);
    const avis = seedAvisForAo(aoId).find((item) => item.id === avisId);
    return avis || null;
  }

  try {
    const raw = await apiClient<unknown>(`${AVIS_AO_BASE}/${avisId}`, {
      method: "GET",
    });
    const result = unwrapItem<BackendAvisAo>(raw);
    return mapBackendAvisToFrontend(result, aoId);
  } catch {
    return null;
  }
}

export async function saveServiceContractantTenderAvisDraft(
  aoId: string,
  payload: SaveTenderAvisPayload,
): Promise<TenderAvisItem> {
  if (USE_MOCK) {
    await sleep(260);
    const list = seedAvisForAo(aoId);
    const now = new Date().toISOString();
    const next: TenderAvisItem = {
      id: `AVIS-${aoId}-${Math.floor(1000 + Math.random() * 9000)}`,
      aoId,
      ...payload,
      isPublished: false,
      status: "brouillon",
      publieBomop: false,
      publiePresse: false,
      createdAt: now,
      updatedAt: now,
    };

    list.unshift(next);
    avisStore.set(aoId, list);
    return next;
  }

  const mapped = mapAvisPayloadToBackend(aoId, payload, false);
  const raw = await apiClient<unknown>(AVIS_AO_BASE, {
    method: "POST",
    body: JSON.stringify(mapped),
  });
  const result = unwrapItem<BackendAvisAo>(raw);
  return mapBackendAvisToFrontend(result, aoId);
}

export async function publishServiceContractantTenderAvis(
  aoId: string,
  payload: SaveTenderAvisPayload,
): Promise<TenderAvisItem> {
  if (USE_MOCK) {
    await sleep(280);
    const list = seedAvisForAo(aoId);
    const now = new Date().toISOString();
    const flags = resolvePublicationFlags(payload.support, true);
    const next: TenderAvisItem = {
      id: `AVIS-${aoId}-${Math.floor(1000 + Math.random() * 9000)}`,
      aoId,
      ...payload,
      isPublished: true,
      status: "publie",
      publieBomop: flags.publieBomop,
      publiePresse: flags.publiePresse,
      createdAt: now,
      updatedAt: now,
    };

    list.unshift(next);
    avisStore.set(aoId, list);
    return next;
  }

  const mapped = mapAvisPayloadToBackend(aoId, payload, true);
  const raw = await apiClient<unknown>(AVIS_AO_BASE, {
    method: "POST",
    body: JSON.stringify(mapped),
  });
  const result = unwrapItem<BackendAvisAo>(raw);
  return mapBackendAvisToFrontend(result, aoId);
}

export async function updateServiceContractantTenderAvis(
  aoId: string,
  avisId: string,
  payload: SaveTenderAvisPayload,
  publish = false,
): Promise<TenderAvisItem> {
  if (USE_MOCK) {
    await sleep(240);
    const list = seedAvisForAo(aoId);
    const index = list.findIndex((item) => item.id === avisId);

    if (index < 0) {
      throw new Error("Avis introuvable");
    }

    const flags = resolvePublicationFlags(payload.support, publish);
    const updated: TenderAvisItem = {
      ...list[index],
      ...payload,
      isPublished: publish || list[index].isPublished,
      status: publish || list[index].isPublished ? "publie" : "brouillon",
      publieBomop: publish ? flags.publieBomop : list[index].publieBomop,
      publiePresse: publish ? flags.publiePresse : list[index].publiePresse,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    avisStore.set(aoId, list);
    return updated;
  }

  const mapped = mapAvisPayloadToBackend(aoId, payload, publish);
  const raw = await apiClient<unknown>(`${AVIS_AO_BASE}/${avisId}`, {
    method: "PATCH",
    body: JSON.stringify(mapped),
  });
  const result = unwrapItem<BackendAvisAo>(raw);
  return mapBackendAvisToFrontend(result, aoId);
}

export async function publishServiceContractantTenderAvisById(
  aoId: string,
  avisId: string,
): Promise<TenderAvisItem> {
  if (USE_MOCK) {
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
      publieBomop: true,
      publiePresse:
        list[index].support === "presse" || list[index].support === "plateforme",
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    avisStore.set(aoId, list);
    return updated;
  }

  const existing = await getServiceContractantTenderAvisById(aoId, avisId);
  if (!existing) {
    throw new Error("Avis introuvable");
  }

  const flags = resolvePublicationFlags(existing.support, true);
  const raw = await apiClient<unknown>(`${AVIS_AO_BASE}/${avisId}`, {
    method: "PATCH",
    body: JSON.stringify({
      aoId,
      typeAvis: mapTypeToBackend(existing.type),
      contenuBomop: stripHtml(existing.content) || existing.title,
      datePublication: toBackendDate(existing.publicationDate),
      publieBomop: flags.publieBomop,
      publiePresse: flags.publiePresse,
    }),
  });
  const result = unwrapItem<BackendAvisAo>(raw);
  return mapBackendAvisToFrontend(result, aoId);
}

export async function deleteServiceContractantTenderAvis(
  aoId: string,
  avisId: string,
): Promise<void> {
  if (USE_MOCK) {
    await sleep(180);
    const list = seedAvisForAo(aoId);
    const next = list.filter((item) => item.id !== avisId);
    if (next.length === list.length) {
      throw new Error("Avis introuvable");
    }
    avisStore.set(aoId, next);
    return;
  }

  await apiClient<unknown>(`${AVIS_AO_BASE}/${avisId}`, {
    method: "DELETE",
  });
}
