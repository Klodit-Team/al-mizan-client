import {
  listOperateurAppelsOffres,
  getOperateurAppelOffreById,
  type OeAoItem,
} from "@/services/operateur-appels-offres/api";
import { apiClient } from "@/services/client";

/**
 * Liste publique des AOs — pas de soumissions (pas d'auth requise).
 * On réutilise la même logique que listOperateurAppelsOffres mais sans
 * fetcher /api/v1/soumissions qui requiert une authentification.
 */

interface AppelOffreRecord {
  id: string;
  reference?: string;
  objet?: string;
  typeProcedure?: string;
  dateLimiteSoumission?: string;
  statut?: string;
  wilaya?: string;
  secteurActivite?: string;
  montantEstime?: number | string;
  organisationName?: string;
  lots?: { id: string; numero?: string; designation?: string; montantEstime?: number | string }[];
}

interface PaginatedPayload<T> { data: T[]; }
interface ApiEnvelope<T> { data?: T; success?: boolean; statusCode?: number; }

function unwrapEnvelope<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in (payload as Record<string, unknown>) &&
    ("success" in (payload as Record<string, unknown>) ||
      "statusCode" in (payload as Record<string, unknown>))
  ) {
    return (payload as ApiEnvelope<T>).data as T;
  }
  return payload as T;
}

function extractList<T>(payload: unknown): T[] {
  const unwrapped = unwrapEnvelope<unknown>(payload);
  if (Array.isArray(unwrapped)) return unwrapped as T[];
  if (
    unwrapped &&
    typeof unwrapped === "object" &&
    Array.isArray((unwrapped as PaginatedPayload<T>).data)
  ) {
    return (unwrapped as PaginatedPayload<T>).data;
  }
  return [];
}

function formatAmount(value?: string | number | null): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const asNumber = Number(value);
  if (Number.isNaN(asNumber)) return String(value);
  return `${new Intl.NumberFormat("fr-DZ").format(asNumber)} DZD`;
}

function normalizeAoType(value: unknown) {
  const raw = String(value ?? "").trim().toUpperCase();
  if (raw.includes("RESTREINT")) return "restreint" as const;
  if (raw.includes("GRE")) return "gre_a_gre" as const;
  return "ouvert" as const;
}

function normalizeAoStatus(value: unknown) {
  const raw = String(value ?? "").trim().toUpperCase();
  if (raw === "PUBLIE") return "publie" as const;
  if (raw === "EN_COURS" || raw === "OUVERTURE_PLIS") return "en_cours" as const;
  if (raw === "EVALUATION") return "evaluation" as const;
  if (raw === "ATTRIBUE") return "attribue" as const;
  if (raw === "ANNULE") return "annule" as const;
  return "cloture" as const;
}

function mapAoRecordPublic(ao: AppelOffreRecord): OeAoItem {
  const lots = (ao.lots || []).map((lot, index) => ({
    id: lot.id || `${ao.id}-lot-${index + 1}`,
    lotNumber: lot.numero || String(index + 1),
    designation: lot.designation || `Lot ${index + 1}`,
    estimatedAmount: formatAmount(lot.montantEstime),
  }));

  return {
    id: ao.id,
    reference: ao.reference || ao.id,
    object: ao.objet || "Objet non renseigne",
    type: normalizeAoType(ao.typeProcedure),
    deadline: ao.dateLimiteSoumission || new Date().toISOString(),
    status: normalizeAoStatus(ao.statut),
    organizationName: ao.organisationName || "Service contractant",
    wilaya: ao.wilaya || "N/A",
    sector: ao.secteurActivite || "N/A",
    estimatedAmount: formatAmount(ao.montantEstime),
    hasSubmission: false,
    submissionStatus: undefined,
    lots,
  };
}

async function getAoByIdPublic(id: string): Promise<AppelOffreRecord | null> {
  const payload = await apiClient<unknown>(`/api/v1/appels-offres/${id}`, {
    method: "GET",
  }).catch(() => null);
  if (!payload) return null;
  const ao = unwrapEnvelope<AppelOffreRecord>(payload);
  return ao?.id ? ao : null;
}

export async function listPublicAppelsOffres(): Promise<OeAoItem[]> {
  const payload = await apiClient<unknown>(
    "/api/v1/appels-offres?page=1&limit=500",
    { method: "GET" },
  ).catch(() => []);

  const rawAos = extractList<AppelOffreRecord>(payload);

  // Hydrate lots if missing
  const missingLots = rawAos.filter(
    (ao) => !Array.isArray(ao.lots) || ao.lots.length === 0,
  );

  if (missingLots.length > 0) {
    const detailed = await Promise.all(
      missingLots.map((ao) => getAoByIdPublic(ao.id)),
    );
    const detailedById = new Map<string, AppelOffreRecord>();
    detailed.forEach((ao) => {
      if (ao && Array.isArray(ao.lots) && ao.lots.length > 0) {
        detailedById.set(ao.id, ao);
      }
    });
    const hydrated = rawAos.map((ao) => detailedById.get(ao.id) || ao);
    return hydrated
      .filter((ao) => String(ao.statut || "").toUpperCase() !== "BROUILLON")
      .map(mapAoRecordPublic)
      .sort(
        (a, b) =>
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
      );
  }

  return rawAos
    .filter((ao) => String(ao.statut || "").toUpperCase() !== "BROUILLON")
    .map(mapAoRecordPublic)
    .sort(
      (a, b) =>
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    );
}

export async function getPublicAppelOffreById(
  id: string,
): Promise<OeAoItem | null> {
  const ao = await getAoByIdPublic(id);
  if (!ao || !ao.id) return null;
  return mapAoRecordPublic(ao);
}