import { apiClient } from "@/services/client";

export interface ActiveSession {
  id: string;
  userId: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  lastActivity: string;
  expiresAt?: string;
}

const AUTH_SESSIONS_BASE_PATH = "/api/v1/auth/sessions";

type RawSession = Record<string, unknown>;

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function pickString(record: RawSession, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }
  }

  return fallback;
}

function extractSessionList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const record = payload as RawSession;
    const nested = record.sessions ?? record.data ?? record.items;
    return Array.isArray(nested) ? nested : [];
  }

  return [];
}

function normalizeSession(raw: unknown): ActiveSession | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as RawSession;
  const id = pickString(record, ["id", "sessionId", "session_id"]);

  if (!id) {
    return null;
  }

  const user = record.user && typeof record.user === "object"
    ? (record.user as RawSession)
    : {};

  return {
    id,
    userId: pickString(record, ["userId", "user_id", "sub"], pickString(user, ["id", "userId", "user_id", "email"], "Utilisateur")),
    ip: pickString(record, ["ip", "ipAddress", "ip_address", "remoteAddress"], "N/A"),
    userAgent: pickString(record, ["userAgent", "user_agent"], "N/A"),
    createdAt: pickString(record, ["createdAt", "created_at", "date", "loginAt", "login_at"], new Date().toISOString()),
    lastActivity: pickString(record, ["lastActivity", "lastActivityAt", "last_activity_at", "updatedAt", "updated_at"], pickString(record, ["createdAt", "created_at", "date"], new Date().toISOString())),
    expiresAt: asString(record.expiresAt ?? record.expires_at) || undefined,
  };
}

export async function listActiveSessions(): Promise<ActiveSession[]> {
  const payload = await apiClient<unknown>(AUTH_SESSIONS_BASE_PATH, {
    method: "GET",
  });

  return extractSessionList(payload)
    .map(normalizeSession)
    .filter((session): session is ActiveSession => session !== null);
}

export async function revokeSession(sessionId: string): Promise<void> {
  await apiClient<void>(`${AUTH_SESSIONS_BASE_PATH}/${sessionId}`, {
    method: "DELETE",
  });
}
