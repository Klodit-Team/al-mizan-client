import { apiClient } from "@/services/client";

// ─────────────────────────────────────────────────────────────────────────────
// Enums (mirrored from backend)
// ─────────────────────────────────────────────────────────────────────────────

export type StatutEvaluation = "BROUILLON" | "ACTIVE" | "CLOTUREE" | "ANNULEE";
export type StatutMarche =
  | "EN_COURS"
  | "DELIBERATION"
  | "ATTRIBUEE"
  | "ANNULEE"
  | "INFRUCTUEUSE";
export type StatutSeance = "PROGRAMMEE" | "EN_COURS" | "TERMINEE";
export type RoleMembreEvaluation =
  | "PRESIDENT"
  | "MEMBRE"
  | "RAPPORTEUR"
  | "OBSERVATEUR";
export type RoleMembreMarche =
  | "PRESIDENT"
  | "MEMBRE"
  | "RAPPORTEUR"
  | "CONTROLEUR"
  | "OBSERVATEUR";

// ─────────────────────────────────────────────────────────────────────────────
// Entities
// ─────────────────────────────────────────────────────────────────────────────

export interface MembreEvaluation {
  id: string;
  commissionId: string;
  userId: string;
  nom: string;
  prenom: string;
  role: RoleMembreEvaluation;
  dateNomination?: string;
  actif: boolean;
}

export interface CommissionEvaluation {
  id: string;
  reference: string;
  objet: string;
  dateCreation: string;
  dateReunion?: string;
  statut: StatutEvaluation;
  presidentId: string;
  observations?: string;
  aoId?: string | null;
  appelOffreId?: string | null;
  seanceId?: string | null;
  membres?: MembreEvaluation[];
  createdAt: string;
  updatedAt: string;
}

export interface MembreMarche {
  id: string;
  commissionId: string;
  userId: string;
  nom: string;
  prenom: string;
  role: RoleMembreMarche;
  dateNomination?: string;
  actif: boolean;
}

export interface CommissionMarche {
  id: string;
  reference: string;
  intitule: string;
  typeMarche: string;
  dateCreation: string;
  dateDeliberation?: string;
  statut: StatutMarche;
  presidentId: string;
  pvDeliberation?: string;
  soumissionnaireRetenuId?: string;
  membres?: MembreMarche[];
  createdAt: string;
  updatedAt: string;
}

export interface ResultatOuverture {
  id: string;
  seanceId: string;
  soumissionId: string;
  montantFinancier?: number;
  estConforme: boolean;
  observations?: string;
}

export interface SeanceOuverture {
  id: string;
  commissionId?: string;
  appelOffreId: string;
  dateSeance: string;
  statut: StatutSeance;
  pvUrl?: string;
  resultats?: ResultatOuverture[];
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────────────────────

export interface PaginationQuery {
  page?: number;
  limit?: number;
  statut?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DTOs
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateCommissionEvaluationDto {
  reference: string;
  objet: string;
  dateCreation: string;
  dateReunion?: string;
  presidentId: string;
  observations?: string;
}

export type UpdateCommissionEvaluationDto =
  Partial<CreateCommissionEvaluationDto>;

export interface ChangeStatutEvaluationDto {
  statut: StatutEvaluation;
}

export interface AddMembreEvaluationDto {
  userId: string;
  nom: string;
  prenom: string;
  role: RoleMembreEvaluation;
  dateNomination?: string;
}

export interface UpdateMembreEvaluationDto
  extends Partial<Omit<AddMembreEvaluationDto, "userId">> {
  actif?: boolean;
}

export interface CreateCommissionMarcheDto {
  reference: string;
  intitule: string;
  typeMarche: string;
  dateCreation: string;
  dateDeliberation?: string;
  presidentId: string;
}

export type UpdateCommissionMarcheDto = Partial<CreateCommissionMarcheDto>;

export interface ChangeStatutMarcheDto {
  statut: StatutMarche;
}

export interface AddMembreMarcheDto {
  userId: string;
  nom: string;
  prenom: string;
  role: RoleMembreMarche;
  dateNomination?: string;
}

export interface UpdateMembreMarcheDto
  extends Partial<Omit<AddMembreMarcheDto, "userId">> {
  actif?: boolean;
}

export interface DeliberationDto {
  pvDeliberation: string;
  observations?: string;
}

export interface AttributionDto {
  soumissionnaireRetenuId: string;
  montantAttribution?: number;
  observations?: string;
}

export interface CreateSeanceDto {
  appelOffreId: string;
  commissionId?: string;
  dateSeance: string;
}

export type UpdateSeanceDto = Partial<CreateSeanceDto>;

export interface CreateResultatDto {
  soumissionId: string;
  montantFinancier?: number;
  estConforme: boolean;
  observations?: string;
}

export type UpdateResultatDto = Partial<CreateResultatDto>;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

interface ApiEnvelope<T> {
  data?: T;
  success?: boolean;
  statusCode?: number;
}

function unwrap<T>(payload: unknown): T {
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
  const data = unwrap<unknown>(payload);
  if (Array.isArray(data)) return data as T[];
  if (
    data &&
    typeof data === "object" &&
    Array.isArray((data as { data?: unknown }).data)
  ) {
    return (data as { data: T[] }).data;
  }
  return [];
}

function buildQuery(params: PaginationQuery): string {
  const q = new URLSearchParams();
  if (params.page !== undefined) q.set("page", String(params.page));
  if (params.limit !== undefined) q.set("limit", String(params.limit));
  if (params.statut) q.set("statut", params.statut);
  if (params.dateFrom) q.set("dateFrom", params.dateFrom);
  if (params.dateTo) q.set("dateTo", params.dateTo);
  if (params.search) q.set("search", params.search);
  const str = q.toString();
  return str ? `?${str}` : "";
}

// ─────────────────────────────────────────────────────────────────────────────
// Commission Évaluation API
// ─────────────────────────────────────────────────────────────────────────────

const CE = "/api/v1/commissions-evaluation";

export async function listCommissionsEvaluation(
  params: PaginationQuery = {}
): Promise<PaginatedResponse<CommissionEvaluation>> {
  const raw = await apiClient<unknown>(`${CE}${buildQuery(params)}`, {
    method: "GET",
  });
  const data = unwrap<unknown>(raw);
  // Backend returns paginated envelope or plain array
  if (
    data &&
    typeof data === "object" &&
    Array.isArray((data as { data?: unknown }).data)
  ) {
    return data as PaginatedResponse<CommissionEvaluation>;
  }
  const items = Array.isArray(data) ? (data as CommissionEvaluation[]) : [];
  return { data: items, meta: { total: items.length, page: 1, limit: items.length, totalPages: 1 } };
}

export async function getCommissionEvaluation(
  id: string
): Promise<CommissionEvaluation> {
  const raw = await apiClient<unknown>(`${CE}/${id}`, { method: "GET" });
  return unwrap<CommissionEvaluation>(raw);
}

export async function createCommissionEvaluation(
  dto: CreateCommissionEvaluationDto
): Promise<CommissionEvaluation> {
  const raw = await apiClient<unknown>(CE, {
    method: "POST",
    body: JSON.stringify(dto),
  });
  return unwrap<CommissionEvaluation>(raw);
}

export async function updateCommissionEvaluation(
  id: string,
  dto: UpdateCommissionEvaluationDto
): Promise<CommissionEvaluation> {
  const raw = await apiClient<unknown>(`${CE}/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
  return unwrap<CommissionEvaluation>(raw);
}

export async function deleteCommissionEvaluation(id: string): Promise<void> {
  await apiClient<unknown>(`${CE}/${id}`, { method: "DELETE" });
}

export async function changeStatutEvaluation(
  id: string,
  dto: ChangeStatutEvaluationDto
): Promise<CommissionEvaluation> {
  const raw = await apiClient<unknown>(`${CE}/${id}/statut`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
  return unwrap<CommissionEvaluation>(raw);
}

export async function exportCommissionEvaluationPdf(id: string): Promise<void> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}${CE}/${id}/export-pdf`;
  window.open(url, "_blank");
}

// Membres évaluation

export async function listMembresEvaluation(
  commissionId: string
): Promise<MembreEvaluation[]> {
  const raw = await apiClient<unknown>(`${CE}/${commissionId}/membres`, {
    method: "GET",
  });
  return extractList<MembreEvaluation>(raw);
}

export async function addMembreEvaluation(
  commissionId: string,
  dto: AddMembreEvaluationDto
): Promise<MembreEvaluation> {
  const raw = await apiClient<unknown>(`${CE}/${commissionId}/membres`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
  return unwrap<MembreEvaluation>(raw);
}

export async function updateMembreEvaluation(
  commissionId: string,
  membreId: string,
  dto: UpdateMembreEvaluationDto
): Promise<MembreEvaluation> {
  const raw = await apiClient<unknown>(
    `${CE}/${commissionId}/membres/${membreId}`,
    { method: "PUT", body: JSON.stringify(dto) }
  );
  return unwrap<MembreEvaluation>(raw);
}

export async function removeMembreEvaluation(
  commissionId: string,
  membreId: string
): Promise<void> {
  await apiClient<unknown>(`${CE}/${commissionId}/membres/${membreId}`, {
    method: "DELETE",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Commission Marché API
// ─────────────────────────────────────────────────────────────────────────────

const CM = "/api/v1/commissions-marche";

export async function listCommissionsMarche(
  params: PaginationQuery = {}
): Promise<PaginatedResponse<CommissionMarche>> {
  const raw = await apiClient<unknown>(`${CM}${buildQuery(params)}`, {
    method: "GET",
  });
  const data = unwrap<unknown>(raw);
  if (
    data &&
    typeof data === "object" &&
    Array.isArray((data as { data?: unknown }).data)
  ) {
    return data as PaginatedResponse<CommissionMarche>;
  }
  const items = Array.isArray(data) ? (data as CommissionMarche[]) : [];
  return { data: items, meta: { total: items.length, page: 1, limit: items.length, totalPages: 1 } };
}

export async function getCommissionMarche(
  id: string
): Promise<CommissionMarche> {
  const raw = await apiClient<unknown>(`${CM}/${id}`, { method: "GET" });
  return unwrap<CommissionMarche>(raw);
}

export async function createCommissionMarche(
  dto: CreateCommissionMarcheDto
): Promise<CommissionMarche> {
  const raw = await apiClient<unknown>(CM, {
    method: "POST",
    body: JSON.stringify(dto),
  });
  return unwrap<CommissionMarche>(raw);
}

export async function updateCommissionMarche(
  id: string,
  dto: UpdateCommissionMarcheDto
): Promise<CommissionMarche> {
  const raw = await apiClient<unknown>(`${CM}/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
  return unwrap<CommissionMarche>(raw);
}

export async function deleteCommissionMarche(id: string): Promise<void> {
  await apiClient<unknown>(`${CM}/${id}`, { method: "DELETE" });
}

export async function changeStatutMarche(
  id: string,
  dto: ChangeStatutMarcheDto
): Promise<CommissionMarche> {
  const raw = await apiClient<unknown>(`${CM}/${id}/statut`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
  return unwrap<CommissionMarche>(raw);
}

export async function setDeliberation(
  id: string,
  dto: DeliberationDto
): Promise<CommissionMarche> {
  const raw = await apiClient<unknown>(`${CM}/${id}/deliberation`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
  return unwrap<CommissionMarche>(raw);
}

export async function getDeliberation(id: string): Promise<{ pvDeliberation: string; observations?: string }> {
  const raw = await apiClient<unknown>(`${CM}/${id}/deliberation`, {
    method: "GET",
  });
  return unwrap<{ pvDeliberation: string; observations?: string }>(raw);
}

export async function attribuerMarche(
  id: string,
  dto: AttributionDto
): Promise<CommissionMarche> {
  const raw = await apiClient<unknown>(`${CM}/${id}/attribution`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
  return unwrap<CommissionMarche>(raw);
}

export async function exportCommissionMarchePdf(id: string): Promise<void> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}${CM}/${id}/export-pdf`;
  window.open(url, "_blank");
}

// Membres marché

export async function listMembresMarche(
  commissionId: string
): Promise<MembreMarche[]> {
  const raw = await apiClient<unknown>(`${CM}/${commissionId}/membres`, {
    method: "GET",
  });
  return extractList<MembreMarche>(raw);
}

export async function addMembreMarche(
  commissionId: string,
  dto: AddMembreMarcheDto
): Promise<MembreMarche> {
  const raw = await apiClient<unknown>(`${CM}/${commissionId}/membres`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
  return unwrap<MembreMarche>(raw);
}

export async function updateMembreMarche(
  commissionId: string,
  membreId: string,
  dto: UpdateMembreMarcheDto
): Promise<MembreMarche> {
  const raw = await apiClient<unknown>(
    `${CM}/${commissionId}/membres/${membreId}`,
    { method: "PUT", body: JSON.stringify(dto) }
  );
  return unwrap<MembreMarche>(raw);
}

export async function removeMembreMarche(
  commissionId: string,
  membreId: string
): Promise<void> {
  await apiClient<unknown>(`${CM}/${commissionId}/membres/${membreId}`, {
    method: "DELETE",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Séances d'Ouverture API
// ─────────────────────────────────────────────────────────────────────────────

const SO = "/api/v1/seances-ouverture";

export async function listSeancesOuverture(
  commissionId?: string
): Promise<SeanceOuverture[]> {
  const url = commissionId
    ? `${SO}?commissionId=${commissionId}`
    : SO;
  const raw = await apiClient<unknown>(url, { method: "GET" });
  return extractList<SeanceOuverture>(raw);
}

export async function getSeanceOuverture(id: string): Promise<SeanceOuverture> {
  const raw = await apiClient<unknown>(`${SO}/${id}`, { method: "GET" });
  return unwrap<SeanceOuverture>(raw);
}

export async function createSeanceOuverture(
  dto: CreateSeanceDto
): Promise<SeanceOuverture> {
  const raw = await apiClient<unknown>(SO, {
    method: "POST",
    body: JSON.stringify(dto),
  });
  return unwrap<SeanceOuverture>(raw);
}

export async function updateSeanceOuverture(
  id: string,
  dto: UpdateSeanceDto
): Promise<SeanceOuverture> {
  const raw = await apiClient<unknown>(`${SO}/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
  return unwrap<SeanceOuverture>(raw);
}

export async function deleteSeanceOuverture(id: string): Promise<void> {
  await apiClient<unknown>(`${SO}/${id}`, { method: "DELETE" });
}

export async function demarrerSeance(id: string): Promise<SeanceOuverture> {
  const raw = await apiClient<unknown>(`${SO}/${id}/demarrer`, {
    method: "PATCH",
  });
  return unwrap<SeanceOuverture>(raw);
}

export async function terminerSeance(id: string): Promise<SeanceOuverture> {
  const raw = await apiClient<unknown>(`${SO}/${id}/terminer`, {
    method: "PATCH",
  });
  return unwrap<SeanceOuverture>(raw);
}

export async function generatePV(id: string): Promise<{ url: string }> {
  const raw = await apiClient<unknown>(`${SO}/${id}/pv`, { method: "POST" });
  return unwrap<{ url: string }>(raw);
}

export async function downloadPV(id: string): Promise<void> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}${SO}/${id}/pv`;
  window.open(url, "_blank");
}

// Résultats d'ouverture

export async function listResultats(
  seanceId: string
): Promise<ResultatOuverture[]> {
  const raw = await apiClient<unknown>(`${SO}/${seanceId}/resultats`, {
    method: "GET",
  });
  return extractList<ResultatOuverture>(raw);
}

export async function addResultat(
  seanceId: string,
  dto: CreateResultatDto
): Promise<ResultatOuverture> {
  const raw = await apiClient<unknown>(`${SO}/${seanceId}/resultats`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
  return unwrap<ResultatOuverture>(raw);
}

export async function updateResultat(
  seanceId: string,
  resultatId: string,
  dto: UpdateResultatDto
): Promise<ResultatOuverture> {
  const raw = await apiClient<unknown>(
    `${SO}/${seanceId}/resultats/${resultatId}`,
    { method: "PUT", body: JSON.stringify(dto) }
  );
  return unwrap<ResultatOuverture>(raw);
}

export async function deleteResultat(
  seanceId: string,
  resultatId: string
): Promise<void> {
  await apiClient<unknown>(`${SO}/${seanceId}/resultats/${resultatId}`, {
    method: "DELETE",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard aggregation — "Mes Commissions" pour le membre connecté
// ─────────────────────────────────────────────────────────────────────────────

export interface MesCommissionsData {
  commissionsEvaluation: CommissionEvaluation[];
  commissionsMarche: CommissionMarche[];
  seancesOuverture: SeanceOuverture[];
}

interface CurrentUserPayload {
  user?: {
    userId?: string;
  };
}

function normalizeUserId(value?: string | null): string {
  return (value ?? "").trim().toLowerCase();
}

async function resolveCommissionMemberUserId(userId?: string): Promise<string | null> {
  const directUserId = normalizeUserId(userId);
  if (directUserId) return directUserId;

  const meRaw = await apiClient<unknown>("/api/v1/auth/me", { method: "GET" }).catch(() => null);
  const me = unwrap<CurrentUserPayload>(meRaw);
  const resolvedUserId = normalizeUserId(me?.user?.userId);
  return resolvedUserId || null;
}

async function commissionEvaluationBelongsToUser(
  commission: CommissionEvaluation,
  userId: string,
): Promise<boolean> {
  const members =
    Array.isArray(commission.membres) && commission.membres.length > 0
      ? commission.membres
      : await listMembresEvaluation(commission.id).catch(() => []);

  return members.some((member) => normalizeUserId(member.userId) === userId && member.actif !== false);
}

async function commissionMarcheBelongsToUser(
  commission: CommissionMarche,
  userId: string,
): Promise<boolean> {
  const members =
    Array.isArray(commission.membres) && commission.membres.length > 0
      ? commission.membres
      : await listMembresMarche(commission.id).catch(() => []);

  return members.some((member) => normalizeUserId(member.userId) === userId && member.actif !== false);
}

/**
 * Agrège en parallèle les trois ressources commission.
 * Utilise Promise.allSettled pour qu'une ressource défaillante
 * ne bloque pas les autres (resilient aggregation pattern).
 */
export async function getMesCommissionsData(userId?: string): Promise<MesCommissionsData> {
  const memberUserId = await resolveCommissionMemberUserId(userId);

  const [evalResult, marcheResult, seanceResult] = await Promise.allSettled([
    listCommissionsEvaluation({ page: 1, limit: 100 }),
    listCommissionsMarche({ page: 1, limit: 100 }),
    listSeancesOuverture(),
  ]);

  const commissionsEvaluation =
    evalResult.status === "fulfilled" ? evalResult.value.data : [];
  const commissionsMarche =
    marcheResult.status === "fulfilled" ? marcheResult.value.data : [];
  const seancesOuverture =
    seanceResult.status === "fulfilled" ? seanceResult.value : [];

  if (!memberUserId) {
    return {
      commissionsEvaluation: [],
      commissionsMarche: [],
      seancesOuverture: [],
    };
  }

  const [visibleEvaluation, visibleMarche] = await Promise.all([
    Promise.all(
      commissionsEvaluation.map(async (commission) => ({
        commission,
        visible: await commissionEvaluationBelongsToUser(commission, memberUserId),
      })),
    ),
    Promise.all(
      commissionsMarche.map(async (commission) => ({
        commission,
        visible: await commissionMarcheBelongsToUser(commission, memberUserId),
      })),
    ),
  ]);

  const filteredEvaluation = visibleEvaluation
    .filter((item) => item.visible)
    .map((item) => item.commission);
  const filteredMarche = visibleMarche
    .filter((item) => item.visible)
    .map((item) => item.commission);

  const allowedCommissionIds = new Set([
    ...filteredEvaluation.map((commission) => commission.id),
    ...filteredMarche.map((commission) => commission.id),
  ]);
  const allowedAoIds = new Set([
    ...filteredEvaluation
      .flatMap((commission) => [commission.aoId, commission.appelOffreId])
      .filter((value): value is string => Boolean(value)),
    ...filteredMarche.map((commission) => commission.id),
  ]);

  return {
    commissionsEvaluation: filteredEvaluation,
    commissionsMarche: filteredMarche,
    seancesOuverture: seancesOuverture.filter((seance) => {
      if (seance.commissionId && allowedCommissionIds.has(seance.commissionId)) {
        return true;
      }
      return allowedAoIds.has(seance.appelOffreId);
    }),
  };
}
