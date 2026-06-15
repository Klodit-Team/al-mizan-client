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
  raisonBlacklist: string;
  createdAt: string;          // ISO 8601
}

// ─── UI-facing type used by the admin Operateurs page ────────────────────────

export interface AdminOperateur {
  id: string;
  organisation_id: string;
  user_id: string;
  is_eligible: boolean;
  is_blacklisted: boolean;
  blacklist_motif?: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
  is_active: boolean;
}

const BASE = "/api/v1/operateurs-economiques";

// ─── List ─────────────────────────────────────────────────────────────────────

const dummyOperateurs: AdminOperateur[] = [
  // { id: "2", organisation_id: "3", user_id: "user-2", is_eligible: true, is_blacklisted: false, username: "Sara Hamdi", email: "s.hamdi@btpplus.dz", role: "OPERATEUR_ECONOMIQUE", created_at: "2023-07-01T10:00:00Z", is_active: true },
  // { id: "6", organisation_id: "4", user_id: "user-6", is_eligible: false, is_blacklisted: true, blacklist_motif: "Non respect des délais", username: "Mohamed Ali", email: "m.ali@entreprise.dz", role: "OPERATEUR_ECONOMIQUE", created_at: "2023-09-11T10:00:00Z", is_active: false },
];

/**
 * GET /api/v1/operateurs-economiques
 * List all operateurs. Falls back to dummy data when the endpoint is unavailable.
 */
export async function getAdminOperateurs(): Promise<AdminOperateur[]> {
  try {
    return await apiClient<AdminOperateur[]>(BASE, { method: "GET" });
  } catch {
    return dummyOperateurs;
  }
}

// ─── Blacklist ────────────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/operateurs-economiques/{id}/blacklist
 * Body: { reason: string }
 * {id} here is the OE record id (OperateurEconomiqueEntity.id).
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
