import { apiClient } from "@/services/client";

export interface AuditLog {
  user_id: string;
  action: string;
  entity: string;
  entity_id: string;
  ip_address: string;
  hash_sha256: string;
  hash_precedent: string;
  // Optional fields that might be added by backend
  user?: string;
  role?: string;
  target?: string;
  date?: string;
}

export interface AuditIntegrityResult {
  valid: boolean;
}
const AUDIT_BASE_PATH = '/api/v1/audit';
export async function getAdminAuditLogs(): Promise<AuditLog[]> {
  return apiClient<AuditLog[]>(`${AUDIT_BASE_PATH}/logs`, {
    method: "GET",
  });
}

export async function verifyAdminAuditIntegrity(): Promise<AuditIntegrityResult> {
  const raw = await apiClient<{ data?: { valid?: boolean; invalidCount?: number }; valid?: boolean }>(
    `${AUDIT_BASE_PATH}/integrity/verify`,
    { method: "GET" },
  );
  const payload = (raw as any)?.data ?? raw;
  return { valid: Boolean(payload?.valid ?? payload?.invalidCount === 0) };
}
