import { apiClient } from "@/services/client";

export interface OperateurProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  nif: string;
  nis: string;
  rc: string;
  address: string;
  wilaya: string;
}

export interface OperateurSessionItem {
  id: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  isCurrent: boolean;
}

export interface OperateurSecurityOverview {
  mfaEnabled: boolean;
  sessions: OperateurSessionItem[];
}

interface ApiEnvelope<T> {
  data?: T;
  success?: boolean;
  statusCode?: number;
}

interface MePayload {
  user?: {
    userId?: string;
    email?: string;
  };
}

interface UserProfilePayload {
  nom?: string;
  prenom?: string;
  telephone?: string;
}

function unwrapEnvelope<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in (payload as Record<string, unknown>) &&
    ("success" in (payload as Record<string, unknown>) || "statusCode" in (payload as Record<string, unknown>))
  ) {
    return (payload as ApiEnvelope<T>).data as T;
  }
  return payload as T;
}

export async function getOperateurProfile(): Promise<OperateurProfile> {
  const meRaw = await apiClient<unknown>("/api/v1/auth/me", { method: "GET" });
  const me = unwrapEnvelope<MePayload>(meRaw);
  const userId = me?.user?.userId;
  const email = me?.user?.email || "";

  let firstName = "";
  let lastName = "";
  let phone = "";

  if (userId) {
    try {
      const profileRaw = await apiClient<unknown>(`/api/v1/profiles/user/${userId}`, { method: "GET" });
      const profile = unwrapEnvelope<UserProfilePayload>(profileRaw);
      firstName = profile?.prenom || "";
      lastName = profile?.nom || "";
      phone = profile?.telephone || "";
    } catch {
      // Profile may not exist yet
    }
  }

  return {
    firstName,
    lastName,
    email,
    phone,
    companyName: "",
    nif: "",
    nis: "",
    rc: "",
    address: "",
    wilaya: "",
  };
}

export async function updateOperateurProfile(payload: Partial<OperateurProfile>): Promise<OperateurProfile> {
  const meRaw = await apiClient<unknown>("/api/v1/auth/me", { method: "GET" });
  const me = unwrapEnvelope<MePayload>(meRaw);
  const userId = me?.user?.userId;

  if (userId) {
    await apiClient<unknown>(`/api/v1/profiles/user/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({
        nom: payload.lastName,
        prenom: payload.firstName,
        telephone: payload.phone,
      }),
    }).catch(() => null);
  }

  return getOperateurProfile();
}

export async function getOperateurSecurityOverview(): Promise<OperateurSecurityOverview> {
  const sessionsData = await apiClient<{ sessions: OperateurSessionItem[] }>(
    "/api/v1/auth/sessions",
    { method: "GET" },
  );
  return {
    mfaEnabled: false,
    sessions: sessionsData.sessions || [],
  };
}

export async function revokeOperateurSession(sessionId: string): Promise<void> {
  await apiClient<unknown>(
    `/api/v1/auth/sessions/${sessionId}`,
    { method: "DELETE" },
  );
}

export async function revokeAllOtherOperateurSessions(): Promise<void> {
  await apiClient<unknown>(
    "/api/v1/auth/logout-all",
    { method: "POST" },
  );
}
