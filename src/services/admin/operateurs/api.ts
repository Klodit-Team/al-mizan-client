import { apiClient } from "@/services/client";

// ─── Entity returned by the backend ──────────────────────────────────────────

export interface OperateurEconomiqueEntity {
  id: string;                 // OE record ID
  organisationId: string;
  userId: string;
  qualifications: string;     // CSV string from backend
  categories: string;         // CSV string from backend
  isEligible: boolean;
  isBlacklisted: boolean;
  raisonBlacklist?: string;
  createdAt: string;          // ISO 8601
}

export interface OperateurListResponse {
  data: OperateurEconomiqueEntity[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

const BASE = "/api/v1/operateurs-economiques";

// ─── List ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/operateurs-economiques
 * List all operateurs with pagination.
 */
export async function getAdminOperateurs(
  page: number = 1,
  limit: number = 20
): Promise<OperateurListResponse> {
  return await apiClient<OperateurListResponse>(`${BASE}?page=${page}&limit=${limit}`, { method: "GET" });
}

// ─── Get By ID ────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/operateurs-economiques/{id}
 * Get a single operateur economique by ID.
 */
export async function getOperateurById(id: string): Promise<OperateurEconomiqueEntity> {
  return await apiClient<OperateurEconomiqueEntity>(`${BASE}/${id}`, { method: "GET" });
}

// ─── Update / Delete ──────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/operateurs-economiques/{id}
 * Update an operateur.
 */
export async function updateOperateur(id: string, payload: any): Promise<OperateurEconomiqueEntity> {
  return await apiClient<OperateurEconomiqueEntity>(`${BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * DELETE /api/v1/operateurs-economiques/{id}
 * Delete an operateur.
 */
export async function deleteOperateur(id: string): Promise<{ deleted: boolean }> {
  return await apiClient<{ deleted: boolean }>(`${BASE}/${id}`, {
    method: "DELETE",
  });
}

// ─── Blacklist ────────────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/operateurs-economiques/{id}/blacklist
 * Body: { reason: string }
 */
export async function blacklistAdminOperateur(
  oeId: string,
  reason: string
): Promise<OperateurEconomiqueEntity> {
  return apiClient<OperateurEconomiqueEntity>(`${BASE}/${oeId}/blacklist`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}

/**
 * PATCH /api/v1/operateurs-economiques/{id}/unblacklist
 * No body required.
 */
export async function unblacklistAdminOperateur(
  oeId: string
): Promise<OperateurEconomiqueEntity> {
  return apiClient<OperateurEconomiqueEntity>(`${BASE}/${oeId}/unblacklist`, {
    method: "PATCH",
  });
}
