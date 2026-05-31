import { apiClient } from "@/services/client";

// ─── Enums ────────────────────────────────────────────────────────────────────

export type TypeMarche = "TRAVAUX" | "FOURNITURES" | "SERVICES";

export type CommissionStatut =
  | "EN_COURS"
  | "DELIBERATION"
  | "ATTRIBUEE"
  | "ANNULEE"
  | "INFRUCTUEUSE";

export type RoleMembreMarche =
  | "PRESIDENT"
  | "MEMBRE"
  | "RAPPORTEUR"
  | "CONTROLEUR"
  | "OBSERVATEUR";

// ─── Entities ─────────────────────────────────────────────────────────────────

/** Member of a CommissionMarche */
export interface MembreMarche {
  id: string;
  commissionId: string;
  userId: string;
  nom: string;
  prenom: string;
  fonction: string;
  role: RoleMembreMarche;
  dateNomination: string; // ISO 8601
  actif: boolean;
  /** Nested commission reference (backend may return a string ID or the full object) */
  commission: CommissionMarche | string;
}

/** Full CommissionMarche entity returned by the backend */
export interface CommissionMarche {
  id: string;
  reference: string;
  intitule: string;
  typeMarche: TypeMarche;
  montantEstime: number;
  dateOuvertureOffres: string; // ISO 8601
  dateDeliberations: string;   // ISO 8601
  statut: CommissionStatut;
  presidentId: string;
  pvDeliberation: string;
  soumissionnairesCount: number;
  soumissionnairesRetenu: string;
  membres: MembreMarche[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/** Paginated list wrapper */
export interface PaginatedCommissions {
  data: CommissionMarche[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

/**
 * Body for POST /api/v1/commissions-marche and PUT /api/v1/commissions-marche/{id}
 */
export interface CommissionMarcheDto {
  intitule: string;
  typeMarche: TypeMarche;
  montantEstime?: number;
  dateOuvertureOffres?: string; // ISO 8601 or "YYYY-MM-DD"
  dateDeliberations?: string;   // ISO 8601 or "YYYY-MM-DD"
  statut?: CommissionStatut;
  presidentId: string;
  soumissionnairesCount?: number;
}

export type UpdateCommissionMarcheDto = Partial<CommissionMarcheDto>;

/** Body for PATCH /api/v1/commissions-marche/{id}/statut */
export interface ChangeStatutDto {
  statut: CommissionStatut;
}

/** Query params for GET /api/v1/commissions-marche */
export interface ListCommissionsParams {
  page?: number;   // default: 1
  limit?: number;  // default: 10
  statut?: CommissionStatut;
  dateFrom?: string; // ISO 8601
  dateTo?: string;   // ISO 8601
  search?: string;
}

// ─── Base path ────────────────────────────────────────────────────────────────

const BASE = "/api/v1/commissions-marche";

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * GET /api/v1/commissions-marche
 * Paginated + filtered list of all commissions de marché.
 */
export async function listCommissionsMarche(
  params: ListCommissionsParams = {}
): Promise<PaginatedCommissions> {
  const qs = new URLSearchParams();
  if (params.page    !== undefined) qs.set("page",    String(params.page));
  if (params.limit   !== undefined) qs.set("limit",   String(params.limit));
  if (params.statut)                qs.set("statut",  params.statut);
  if (params.dateFrom)              qs.set("dateFrom", params.dateFrom);
  if (params.dateTo)                qs.set("dateTo",   params.dateTo);
  if (params.search)                qs.set("search",   params.search);

  const query = qs.toString() ? `?${qs.toString()}` : "";
  return apiClient<PaginatedCommissions>(`${BASE}${query}`, { method: "GET" });
}

/**
 * POST /api/v1/commissions-marche
 * Create a new commission de marché.
 * Returns the created CommissionMarche (HTTP 201).
 */
export async function createCommissionMarche(
  payload: CommissionMarcheDto
): Promise<CommissionMarche> {
  return apiClient<CommissionMarche>(BASE, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * GET /api/v1/commissions-marche/{id}
 * Get a single commission by UUID.
 */
export async function getCommissionMarcheById(id: string): Promise<CommissionMarche> {
  return apiClient<CommissionMarche>(`${BASE}/${id}`, { method: "GET" });
}

/**
 * PUT /api/v1/commissions-marche/{id}
 * Replace / fully update a commission de marché.
 */
export async function updateCommissionMarche(
  id: string,
  payload: UpdateCommissionMarcheDto
): Promise<CommissionMarche> {
  return apiClient<CommissionMarche>(`${BASE}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * DELETE /api/v1/commissions-marche/{id}
 * Delete a commission de marché (HTTP 204 – no body).
 */
export async function deleteCommissionMarche(id: string): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: "DELETE" });
}

/**
 * PATCH /api/v1/commissions-marche/{id}/statut
 * Update only the statut field of a commission.
 */
export async function changeCommissionMarcheStatut(
  id: string,
  statut: CommissionStatut
): Promise<CommissionMarche> {
  return apiClient<CommissionMarche>(`${BASE}/${id}/statut`, {
    method: "PATCH",
    body: JSON.stringify({ statut } satisfies ChangeStatutDto),
  });
}

// ─── Aliases used by the admin Commissions page ───────────────────────────────

export type CreateCommissionInput = CommissionMarcheDto;

/** Alias for listCommissionsMarche – used by Commissionspage.tsx */
export const getAdminCommissions = listCommissionsMarche;

/** Alias for createCommissionMarche */
export const createAdminCommission = createCommissionMarche;

/** Alias for updateCommissionMarche */
export const updateAdminCommission = updateCommissionMarche;

/** Alias for deleteCommissionMarche */
export const deleteAdminCommission = deleteCommissionMarche;

/** Alias for changeCommissionMarcheStatut */
export const changeAdminCommissionStatus = changeCommissionMarcheStatut;

