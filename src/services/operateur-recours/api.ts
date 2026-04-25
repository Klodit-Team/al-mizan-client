import { apiClient } from "@/services/client";

export type RecoursStatus = "depose" | "en_examen" | "accepte" | "rejete";

export interface RecoursAttachment {
  id: string;
  nom: string;
  taille: string;
  type: string;
  url?: string;
}

export interface OperateurRecoursItem {
  id: string;
  reference: string;
  aoId: string;
  aoReference: string;
  aoObject: string;
  dateDepot: string;
  dateLimiteReponse: string;
  dateDecision?: string;
  statut: RecoursStatus;
  motif: string;
  piecesJointes: RecoursAttachment[];
  decision?: {
    statut: "accepte" | "rejete";
    motif: string;
    date: string;
  };
  attribution: {
    winner: string;
    montantAttribue: string;
    dateAttribution: string;
  };
}

export interface CreateOperateurRecoursInput {
  appelOffreId: string;
  attributionProvisoireId: string;
  motif: string;
  piecesJointesUrls?: string[];
}

export interface UpdateOperateurRecoursInput {
  id: string;
  motif: string;
}

export interface RecoursCreationAoOption {
  id: string;
  reference: string;
  object: string;
  label: string;
}

export interface RecoursCreationAttributionOption {
  id: string;
  aoId: string;
  label: string;
  dateAttribution: string;
  dateFinRecours: string;
  montantAttribue: string;
}

export interface RecoursCreationOptions {
  aos: RecoursCreationAoOption[];
  attributions: RecoursCreationAttributionOption[];
}

interface ApiEnvelope<T> {
  data?: T;
  success?: boolean;
  statusCode?: number;
}

interface PaginatedPayload<T> {
  data: T[];
}

interface ListPayload<T> {
  items?: T[];
  results?: T[];
  rows?: T[];
}

interface MePayload {
  user?: {
    userId?: string;
  };
}

interface OperateurRecord {
  id: string;
  userId?: string;
  user_id?: string;
}

interface AppelOffreRecord {
  id: string;
  reference?: string;
  objet?: string;
}

interface AttributionRecord {
  id: string;
  aoId?: string;
  ao_id?: string;
  appelOffreId?: string;
  appel_offre_id?: string;
  type?: string;
  dateAttribution?: string;
  date_attribution?: string;
  dateFinRecours?: string;
  date_fin_recours?: string;
  montantAttribue?: string | number;
  montant_attribue?: string | number;
  appelOffres?: AppelOffreRecord;
  appelOffre?: AppelOffreRecord;
  appel_offres?: AppelOffreRecord;
}

interface RecoursRecord {
  id: string;
  reference?: string;
  appelOffreId?: string;
  appel_offre_id?: string;
  statut?: string;
  status?: string;
  motif?: string;
  dateDepot?: string;
  date_depot?: string;
  dateLimiteReponse?: string;
  date_limite_reponse?: string;
  dateDecision?: string;
  date_decision?: string;
  piecesJointes?: Array<Record<string, unknown>>;
  pieces_jointes?: Array<Record<string, unknown>>;
  attachments?: Array<Record<string, unknown>>;
  decision?: {
    statut?: string;
    motif?: string;
    date?: string;
  };
  appelOffre?: {
    id?: string;
    reference?: string;
    objet?: string;
  };
  appel_offre?: {
    id?: string;
    reference?: string;
    objet?: string;
  };
  attribution?: {
    attributaire?: string;
    winner?: string;
    montantAttribue?: string | number;
    montant_attribue?: string | number;
    dateAttribution?: string;
    date_attribution?: string;
  };
}

function unwrapEnvelope<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in (payload as Record<string, unknown>) &&
    (
      "success" in (payload as Record<string, unknown>) ||
      "statusCode" in (payload as Record<string, unknown>)
    )
  ) {
    return (payload as ApiEnvelope<T>).data as T;
  }

  return payload as T;
}

function extractList<T>(payload: unknown): T[] {
  const unwrapped = unwrapEnvelope<unknown>(payload);

  if (Array.isArray(unwrapped)) {
    return unwrapped as T[];
  }

  if (
    unwrapped &&
    typeof unwrapped === "object" &&
    Array.isArray((unwrapped as PaginatedPayload<T>).data)
  ) {
    return (unwrapped as PaginatedPayload<T>).data;
  }

  if (
    unwrapped &&
    typeof unwrapped === "object" &&
    Array.isArray((unwrapped as ListPayload<T>).items)
  ) {
    return (unwrapped as ListPayload<T>).items as T[];
  }

  if (
    unwrapped &&
    typeof unwrapped === "object" &&
    Array.isArray((unwrapped as ListPayload<T>).results)
  ) {
    return (unwrapped as ListPayload<T>).results as T[];
  }

  if (
    unwrapped &&
    typeof unwrapped === "object" &&
    Array.isArray((unwrapped as ListPayload<T>).rows)
  ) {
    return (unwrapped as ListPayload<T>).rows as T[];
  }

  return [];
}

function normalizeString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function idsEqual(a: string, b: string): boolean {
  return normalizeString(a).toLowerCase() === normalizeString(b).toLowerCase();
}

function getAttributionAoId(item: AttributionRecord): string {
  return normalizeString(
    item.aoId ||
      item.ao_id ||
      item.appelOffreId ||
      item.appel_offre_id ||
      item.appelOffres?.id ||
      item.appelOffre?.id ||
      item.appel_offres?.id ||
      "",
  );
}

function getAttributionType(item: AttributionRecord): string {
  return normalizeString(item.type).toUpperCase();
}

function normalizeId(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  return value.trim().toLowerCase();
}

function normalizeDate(value?: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString();
}

function formatAmount(value?: string | number | null): string {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  const num = Number(value);
  if (Number.isNaN(num)) {
    return String(value);
  }

  return `${new Intl.NumberFormat("fr-DZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)} DZD`;
}

function normalizeStatus(value: unknown): RecoursStatus {
  const raw = String(value ?? "").trim().toUpperCase();

  if (raw === "DEPOSE" || raw === "DEPOSEE" || raw === "SUBMITTED") return "depose";
  if (raw === "EN_EXAMEN" || raw === "IN_REVIEW") return "en_examen";
  if (raw === "ACCEPTE" || raw === "ACCEPTEE") return "accepte";
  return "rejete";
}

async function getOperateurIdFromSession(): Promise<string | null> {
  const meRaw = await apiClient<unknown>("/api/v1/auth/me", { method: "GET" }).catch(() => null);
  if (!meRaw) {
    return null;
  }

  const me = unwrapEnvelope<MePayload>(meRaw);
  const userId = me?.user?.userId;
  if (!userId) {
    return null;
  }

  const operatorsRaw = await apiClient<unknown>("/api/v1/users/operateurs-economiques?page=1&limit=200", {
    method: "GET",
  }).catch(() => null);

  if (!operatorsRaw) {
    return null;
  }

  const operators = extractList<OperateurRecord>(operatorsRaw);
  const current = operators.find((item) => {
    const linkedUserId = normalizeId(item.userId ?? item.user_id ?? null);
    return linkedUserId !== null && linkedUserId === normalizeId(userId);
  });

  return current?.id || null;
}

function mapAttachment(raw: Record<string, unknown>, index: number): RecoursAttachment {
  const name = String(raw.nom ?? raw.fileName ?? raw.name ?? `Piece jointe ${index + 1}`);
  return {
    id: String(raw.id ?? `pj-${index + 1}`),
    nom: name,
    taille: String(raw.taille ?? raw.size ?? "-"),
    type: String(raw.type ?? raw.mimeType ?? "fichier"),
    url: typeof raw.url === "string" ? raw.url : typeof raw.fileUrl === "string" ? raw.fileUrl : undefined,
  };
}

function mapAttachmentFromUrl(url: string, index: number): RecoursAttachment {
  const clean = url.split("?")[0];
  const parts = clean.split("/").filter(Boolean);
  const fallbackName = `Piece jointe ${index + 1}`;
  const name = parts[parts.length - 1] || fallbackName;

  return {
    id: `pj-url-${index + 1}`,
    nom: name,
    taille: "-",
    type: "fichier",
    url,
  };
}

function mapRecoursItem(raw: RecoursRecord): OperateurRecoursItem {
  const ao = raw.appelOffre ?? raw.appel_offre;
  const aoId = raw.appelOffreId || raw.appel_offre_id || ao?.id || "";

  const attachmentsRaw = raw.piecesJointes || raw.pieces_jointes || raw.attachments || [];
  const piecesJointes = attachmentsRaw
    .map((entry, index) => {
      if (typeof entry === "string") {
        return mapAttachmentFromUrl(entry, index);
      }

      if (entry && typeof entry === "object") {
        return mapAttachment(entry, index);
      }

      return null;
    })
    .filter((entry): entry is RecoursAttachment => Boolean(entry));

  const dateDepot = normalizeDate(raw.dateDepot || raw.date_depot);
  const dateDecision = normalizeDate(raw.dateDecision || raw.date_decision || raw.decision?.date);

  return {
    id: raw.id,
    reference: raw.reference || raw.id,
    aoId,
    aoReference: ao?.reference || aoId || "AO",
    aoObject: ao?.objet || "Objet non renseigne",
    dateDepot,
    dateLimiteReponse: normalizeDate(raw.dateLimiteReponse || raw.date_limite_reponse),
    dateDecision: dateDecision || undefined,
    statut: normalizeStatus(raw.statut || raw.status),
    motif: raw.motif || "Motif non renseigne",
    piecesJointes,
    decision: raw.decision?.statut
      ? {
        statut: normalizeStatus(raw.decision.statut) === "accepte" ? "accepte" : "rejete",
        motif: raw.decision.motif || "",
        date: normalizeDate(raw.decision.date),
      }
      : undefined,
    attribution: {
      winner: raw.attribution?.winner || raw.attribution?.attributaire || "-",
      montantAttribue: formatAmount(raw.attribution?.montantAttribue ?? raw.attribution?.montant_attribue),
      dateAttribution: normalizeDate(raw.attribution?.dateAttribution || raw.attribution?.date_attribution),
    },
  };
}

export async function listOperateurRecours(): Promise<OperateurRecoursItem[]> {
  const operateurId = await getOperateurIdFromSession();
  if (!operateurId) {
    return [];
  }

  const payload = await apiClient<unknown>(`/api/v1/recours/operateur/${operateurId}`, {
    method: "GET",
  }).catch(() => []);

  return extractList<RecoursRecord>(payload)
    .map((item) => mapRecoursItem(item))
    .sort((a, b) => {
      const aTime = new Date(a.dateDepot || 0).getTime() || 0;
      const bTime = new Date(b.dateDepot || 0).getTime() || 0;
      return bTime - aTime;
    });
}

export async function getOperateurRecoursById(id: string): Promise<OperateurRecoursItem | null> {
  const payload = await apiClient<unknown>(`/api/v1/recours/${id}`, { method: "GET" }).catch(() => null);
  if (!payload) {
    return null;
  }

  const unwrapped = unwrapEnvelope<RecoursRecord>(payload);
  if (!unwrapped?.id) {
    return null;
  }

  return mapRecoursItem(unwrapped);
}

export async function createOperateurRecours(input: CreateOperateurRecoursInput): Promise<OperateurRecoursItem> {
  const operateurId = await getOperateurIdFromSession();
  if (!operateurId) {
    throw new Error("Operateur introuvable pour la session courante");
  }

  const payload = await apiClient<unknown>("/api/v1/recours", {
    method: "POST",
    body: JSON.stringify({
      appelOffreId: input.appelOffreId,
      operateurId,
      attributionProvisoireId: input.attributionProvisoireId,
      motif: input.motif,
      piecesJointesUrls: input.piecesJointesUrls || [],
    }),
  });

  const created = unwrapEnvelope<RecoursRecord>(payload);
  if (!created?.id) {
    throw new Error("Creation du recours invalide");
  }

  return mapRecoursItem(created);
}

export async function updateOperateurRecours(input: UpdateOperateurRecoursInput): Promise<OperateurRecoursItem> {
  const payload = await apiClient<unknown>(`/api/v1/recours/${input.id}`, {
    method: "PATCH",
    body: JSON.stringify({ motif: input.motif }),
  });

  const updated = unwrapEnvelope<RecoursRecord>(payload);
  if (!updated?.id) {
    throw new Error("Mise a jour du recours invalide");
  }

  return mapRecoursItem(updated);
}

export async function listRecoursCreationOptions(): Promise<RecoursCreationOptions> {
  const [aosRaw, attributionsRaw] = await Promise.all([
    apiClient<unknown>("/api/v1/appels-offres?page=1&limit=500", { method: "GET" }).catch(() => []),
    apiClient<unknown>("/api/v1/appels-offres/attributions", { method: "GET" }).catch(() => []),
  ]);

  const aos = extractList<AppelOffreRecord>(aosRaw)
    .filter((item) => Boolean(item?.id))
    .map((item) => ({
      id: normalizeString(item.id),
      reference: item.reference || item.id,
      object: item.objet || "Objet non renseigne",
      label: `${item.reference || item.id} - ${item.objet || "Objet non renseigne"}`,
    }));

  const aoById = new Map(aos.map((item) => [normalizeId(item.id), item]));

  const attributions = extractList<AttributionRecord>(attributionsRaw)
    .filter((item) => {
      const rawType = getAttributionType(item);
      return rawType === "PROVISOIRE";
    })
    .map((item) => {
      const aoId = getAttributionAoId(item);
      const ao = aoById.get(normalizeId(aoId));
      const linkedAo = item.appelOffres || item.appelOffre || item.appel_offres;
      const ref = ao?.reference || linkedAo?.reference || aoId || "AO";

      return {
        id: normalizeString(item.id),
        aoId,
        label: `Attribution provisoire ${ref} - ${fmtDateForLabel(item.dateAttribution || item.date_attribution)}`,
        dateAttribution: normalizeDate(item.dateAttribution || item.date_attribution),
        dateFinRecours: normalizeDate(item.dateFinRecours || item.date_fin_recours),
        montantAttribue: formatAmount(item.montantAttribue ?? item.montant_attribue),
      };
    })
    .filter((item) => Boolean(item.id))
    .sort((a, b) => {
      const aDate = new Date(a.dateAttribution || 0).getTime() || 0;
      const bDate = new Date(b.dateAttribution || 0).getTime() || 0;
      return bDate - aDate;
    });

  const dedupedAos = aos.filter((ao, index, list) => {
    return list.findIndex((entry) => idsEqual(entry.id, ao.id)) === index;
  });

  const dedupedAttributions = attributions.filter((attr, index, list) => {
    return list.findIndex((entry) => idsEqual(entry.id, attr.id)) === index;
  });

  return { aos: dedupedAos, attributions: dedupedAttributions };
}

function fmtDateForLabel(value?: string): string {
  if (!value) {
    return "date non renseignee";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "date non renseignee";
  }

  return date.toLocaleDateString("fr-DZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
