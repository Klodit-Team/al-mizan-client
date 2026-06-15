import { apiClient } from "@/services/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrgType =
  | "EPA"
  | "EPIC"
  | "MINISTERE"
  | "ENTREPRISE_PRIVEE"
  | "ENTREPRISE_PUBLIQUE"
  | "GROUPEMENT";

/** Matches the backend OrganisationEntity exactly */
export interface OrganisationEntity {
  id: string;
  denomination: string;
  nif: string;
  nis: string;
  registreCommerce: string;
  adresse: string;
  wilaya: string;
  commune: string;
  telephone: string;
  email: string;
  type: OrgType;
  isVerified: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/** Paginated list response */
export interface PaginatedOrganisations {
  data: OrganisationEntity[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

/** Query params for GET /api/v1/organisations */
export interface ListOrganisationsParams {
  q?: string;
  type?: OrgType;
  isVerified?: boolean;
  page?: number;
  limit?: number;
}

const BASE = "/api/v1/organisations";

// ─── Endpoints ────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/organisations
 * List all organisations with optional filters & pagination.
 */
export async function listOrganisations(
  params: ListOrganisationsParams = {}
): Promise<PaginatedOrganisations> {
  const qs = new URLSearchParams();
  if (params.q)          qs.set("q", params.q);
  if (params.type)       qs.set("type", params.type);
  if (params.isVerified !== undefined) qs.set("isVerified", String(params.isVerified));
  if (params.page  !== undefined)  qs.set("page",  String(params.page));
  if (params.limit !== undefined)  qs.set("limit", String(params.limit));

  const query = qs.toString() ? `?${qs.toString()}` : "";
  
  try {
    return await apiClient<PaginatedOrganisations>(`${BASE}${query}`, { method: "GET" });
  } catch (error: any) {
    console.error("API Error in listOrganisations:", error);
    throw error;
  }
}

/**
 * GET /api/v1/organisations/{id}
 * Get a single organisation by its ID.
 */
export async function getOrganisationById(id: string): Promise<OrganisationEntity> {
  return apiClient<OrganisationEntity>(`${BASE}/${id}`, { method: "GET" });
}

/**
 * PATCH /api/v1/organisations/{id}/verify
 * Mark an organisation as verified. Returns the updated OrganisationEntity.
 */
export async function verifyOrganisation(id: string): Promise<OrganisationEntity> {
  return apiClient<OrganisationEntity>(`${BASE}/${id}/verify`, { method: "PATCH" });
}

/**
 * PATCH /api/v1/organisations/{id}
 * Update an organisation.
 */
export async function updateOrganisation(
  id: string,
  payload: Record<string, any>
): Promise<OrganisationEntity> {
  return apiClient<OrganisationEntity>(`${BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * DELETE /api/v1/organisations/{id}
 * Delete an organisation.
 */
export async function deleteOrganisation(id: string): Promise<{ deleted: boolean }> {
  return apiClient<{ deleted: boolean }>(`${BASE}/${id}`, { method: "DELETE" });
}
