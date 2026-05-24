import { apiClient } from "@/services/client";

export interface ContractantSessionItem {
  id: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  isCurrent: boolean;
}

export interface ContractantSecurityOverview {
  mfaEnabled: boolean;
  sessions: ContractantSessionItem[];
}

export interface MfaSetupData {
  manualKey: string;
}

export async function getContractantSecurityOverview(): Promise<ContractantSecurityOverview> {
  const sessionsData = await apiClient<{ sessions: ContractantSessionItem[] }>(
    "/api/v1/auth/sessions",
    { method: "GET" },
  );
  return {
    mfaEnabled: false,
    sessions: sessionsData.sessions || [],
  };
}

export async function startContractantMfaSetup(): Promise<MfaSetupData> {
  return apiClient<MfaSetupData>(
    "/api/v1/auth/mfa/setup",
    { method: "POST" },
  );
}

export async function confirmContractantMfaSetup(code: string): Promise<void> {
  await apiClient<unknown>(
    "/api/v1/auth/mfa/confirm",
    { method: "POST", body: JSON.stringify({ code }) },
  );
}

export async function disableContractantMfa(password: string): Promise<void> {
  await apiClient<unknown>(
    "/api/v1/auth/mfa/disable",
    { method: "POST", body: JSON.stringify({ password }) },
  );
}

export async function revokeContractantSession(sessionId: string): Promise<void> {
  await apiClient<unknown>(
    `/api/v1/auth/sessions/${sessionId}`,
    { method: "DELETE" },
  );
}

export async function revokeAllOtherContractantSessions(): Promise<void> {
  await apiClient<unknown>(
    "/api/v1/auth/logout-all",
    { method: "POST" },
  );
}
