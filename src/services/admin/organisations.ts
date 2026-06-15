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
    console.log("here orgaaaa")
    console.log(error);
    return {
      data: [
        // { id: "1", denomination: "Ministère de l'Énergie et des Mines", nif: "123456789012345", nis: "12345678901234", registreCommerce: "RC-2020-001", adresse: "Rue Didouche Mourad", wilaya: "Alger", commune: "Hussein Dey", telephone: "+213 21 000 001", email: "contact@energie.gov.dz", type: "MINISTERE", isVerified: true, createdAt: "2023-01-15T10:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
        // { id: "2", denomination: "TechBuild SARL", nif: "987654321098765", nis: "98765432109876", registreCommerce: "RC-2019-045", adresse: "Zone Industrielle Rouiba", wilaya: "Alger", commune: "Rouiba", telephone: "+213 21 000 002", email: "info@techbuild.dz", type: "ENTREPRISE_PRIVEE", isVerified: true, createdAt: "2023-03-10T09:00:00Z", updatedAt: "2024-02-01T00:00:00Z" },
        // { id: "3", denomination: "BTP-Plus SPA", nif: "111222333444555", nis: "11122233344455", registreCommerce: "RC-2021-078", adresse: "Cité des Annassers", wilaya: "Alger", commune: "Kouba", telephone: "+213 21 000 003", email: "contact@btpplus.dz", type: "ENTREPRISE_PUBLIQUE", isVerified: false, createdAt: "2023-06-20T08:00:00Z", updatedAt: "2024-03-01T00:00:00Z" },
        // { id: "4", denomination: "Agence Nationale de l'Eau", nif: "222333444555666", nis: "22233344455566", registreCommerce: "RC-2018-012", adresse: "Boulevard Krim Belkacem", wilaya: "Alger", commune: "El Mouradia", telephone: "+213 21 000 004", email: "info@ane.gov.dz", type: "EPA", isVerified: true, createdAt: "2023-02-05T11:00:00Z", updatedAt: "2024-01-15T00:00:00Z" },
        // { id: "5", denomination: "Sonelgaz EPIC", nif: "333444555666777", nis: "33344455566677", registreCommerce: "RC-2015-003", adresse: "Boulevard Khelifa Boukhalfa", wilaya: "Alger", commune: "Hydra", telephone: "+213 21 000 005", email: "contact@sonelgaz.dz", type: "EPIC", isVerified: false, createdAt: "2023-08-12T14:00:00Z", updatedAt: "2024-04-01T00:00:00Z" },
        // { id: "6", denomination: "Groupement Hydraulique Nord", nif: "444555666777888", nis: "44455566677788", registreCommerce: "RC-2022-099", adresse: "Rue des Frères Bouadou", wilaya: "Blida", commune: "Blida", telephone: "+213 25 000 006", email: "info@ghn.dz", type: "GROUPEMENT", isVerified: false, createdAt: "2023-11-01T10:00:00Z", updatedAt: "2024-05-01T00:00:00Z" },
      ],
      meta: { total: 6, page: 1, limit: 100 }
    };
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
