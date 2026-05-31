import { apiClient } from "@/services/client";

// ─── Entity ────────────────────────────────────────────────────────────────────

/** Matches the backend session object from GET /api/v1/auth/sessions */
export interface ActiveSession {
  id: string;           // UUID
  deviceInfo: string;   // e.g. "Chrome Windows"
  ipAddress: string;    // e.g. "192.168.1.1"
  createdAt: string;    // ISO 8601
  expiresAt: string;    // ISO 8601
}

const BASE = "/api/v1/auth/sessions";

// ─── Endpoints ─────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/auth/sessions
 * Returns all active sessions for the authenticated user.
 * Response: ActiveSession[]
 */
export async function listActiveSessions(): Promise<ActiveSession[]> {
  return apiClient<ActiveSession[]>(BASE, { method: "GET" });
}

/**
 * DELETE /api/v1/auth/sessions/{id}
 * Revoke (terminate) a specific session by its UUID.
 */
export async function revokeSession(sessionId: string): Promise<void> {
  await apiClient<void>(`${BASE}/${sessionId}`, { method: "DELETE" });
}
