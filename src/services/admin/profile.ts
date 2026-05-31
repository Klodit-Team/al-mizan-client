import { apiClient } from "@/services/client";

// ─── Entity ────────────────────────────────────────────────────────────────────

/** Matches backend ProfileEntity exactly */
export interface AdminProfileEntity {
  id: string;
  userId: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  langue: "ar" | "fr";
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/** Partial update DTO for admin profile */
export interface UpdateAdminProfileInput {
  nom?: string;
  prenom?: string;
  telephone?: string;
  langue?: "ar" | "fr";
}

const BASE = "/api/v1/profiles";

// ─── Endpoints ─────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/profiles/user/{userId}
 * Get admin's profile by auth user ID.
 */
export async function getAdminProfile(userId: string): Promise<AdminProfileEntity> {
  return apiClient<AdminProfileEntity>(`${BASE}/user/${userId}`, { method: "GET" });
}

/**
 * PATCH /api/v1/profiles/user/{userId}
 * Update admin's profile by auth user ID.
 * Body: { nom?, prenom?, telephone?, langue? }
 */
export async function updateAdminProfile(
  userId: string,
  payload: UpdateAdminProfileInput
): Promise<AdminProfileEntity> {
  return apiClient<AdminProfileEntity>(`${BASE}/user/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * GET /api/v1/profiles/{id}
 * Get admin's profile by profile ID.
 */
export async function getAdminProfileById(profileId: string): Promise<AdminProfileEntity> {
  return apiClient<AdminProfileEntity>(`${BASE}/${profileId}`, { method: "GET" });
}

/**
 * PATCH /api/v1/profiles/{id}
 * Update admin's profile by profile ID.
 */
export async function updateAdminProfileById(
  profileId: string,
  payload: UpdateAdminProfileInput
): Promise<AdminProfileEntity> {
  return apiClient<AdminProfileEntity>(`${BASE}/${profileId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
