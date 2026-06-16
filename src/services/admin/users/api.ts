import { apiClient } from "@/services/client";
import type {
  ProfileEntity,
  RoleEntity,
  AssignRoleDto,
  UserRoleEntity,
} from "@/components/dashboard/admin/users/types";

// ─── Base paths ──────────────────────────────────────────────────────────────
const PROFILES_BASE = "/api/v1/profiles";
const USERS_BASE    = "/api/v1/users";

// ─── Profile CRUD ─────────────────────────────────────────────────────────────

/**
 * POST /api/v1/profiles
 * Create a user profile.
 * Body: { userId, nom, prenom, telephone?, langue }
 */
export interface CreateProfileDto {
  userId: string;
  nom: string;
  prenom: string;
  telephone?: string;
  langue: "ar" | "fr";
}

export async function createUserProfile(payload: CreateProfileDto): Promise<ProfileEntity> {
  return apiClient<ProfileEntity>(PROFILES_BASE, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * GET /api/v1/profiles/user/{userId}
 * Get profile by auth user ID.
 */
export async function getProfileByUserId(userId: string): Promise<ProfileEntity> {
  return apiClient<ProfileEntity>(`${PROFILES_BASE}/user/${userId}`, {
    method: "GET",
  });
}

/**
 * PATCH /api/v1/profiles/user/{userId}
 * Update profile fields by auth user ID.
 * Body: { nom?, prenom?, telephone?, langue? }
 */
export type UpdateProfileDto = Partial<Pick<ProfileEntity, "nom" | "prenom" | "telephone" | "langue">>;

export async function updateProfileByUserId(
  userId: string,
  payload: UpdateProfileDto
): Promise<ProfileEntity> {
  return apiClient<ProfileEntity>(`${PROFILES_BASE}/user/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * GET /api/v1/profiles/{id}
 * Get profile by profile ID.
 */
export async function getProfileById(profileId: string): Promise<ProfileEntity> {
  return apiClient<ProfileEntity>(`${PROFILES_BASE}/${profileId}`, {
    method: "GET",
  });
}

/**
 * PATCH /api/v1/profiles/{id}
 * Update profile by profile ID.
 */
export async function updateProfileById(
  profileId: string,
  payload: UpdateProfileDto
): Promise<ProfileEntity> {
  return apiClient<ProfileEntity>(`${PROFILES_BASE}/${profileId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * DELETE /api/v1/profiles/{id}
 * Delete a profile by profile ID.
 */
export async function deleteProfile(profileId: string): Promise<{ deleted: boolean }> {
  return apiClient<{ deleted: boolean }>(`${PROFILES_BASE}/${profileId}`, {
    method: "DELETE",
  });
}

// ─── Admin helpers ─────────────────────────────────────────────────────────────

/**
 * GET /api/v1/profiles  (or via users base if paginated)
 * Fetch all profiles for the admin user list.
 */
export async function getAdminUserProfiles(): Promise<ProfileEntity[]> {
  return apiClient<ProfileEntity[]>(PROFILES_BASE, {
    method: "GET",
  });
}

// ─── Roles ───────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/roles
 * Returns all available system roles.
 * Used to resolve role name ↔ roleId UUID for AssignRoleDto.
 */
export async function getAdminRoles(): Promise<RoleEntity[]> {
  return apiClient<RoleEntity[]>("/api/v1/roles", {
    method: "GET",
  });
}

/**
 * POST /api/v1/roles
 * Create a new system role.
 */
export async function createRole(payload: { name: string; description: string }): Promise<RoleEntity> {
  return apiClient<RoleEntity>("/api/v1/roles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ─── User-Role Assignments ────────────────────────────────────────────────────

/**
 * POST /api/v1/user-roles
 * Assigns a role to a user.
 * Body matches AssignRoleDto exactly: { userId (UUID), roleId (UUID) }
 * Returns the created UserRoleEntity join record.
 */
export async function assignUserRole(payload: AssignRoleDto): Promise<UserRoleEntity> {
  return apiClient<UserRoleEntity>("/api/v1/user-roles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * GET /api/v1/user-roles/{userId}
 * Returns all role assignments for a specific user.
 */
export async function getUserRoles(userId: string): Promise<UserRoleEntity[]> {
  return apiClient<UserRoleEntity[]>(`/api/v1/user-roles/${userId}`, {
    method: "GET",
  });
}

/**
 * DELETE /api/v1/user-roles/{userId}/{roleId}
 * Removes a role from a user.
 */
export async function removeUserRole(userId: string, roleId: string): Promise<{ deleted: boolean }> {
  return apiClient<{ deleted: boolean }>(`/api/v1/user-roles/${userId}/${roleId}`, {
    method: "DELETE",
  });
}
