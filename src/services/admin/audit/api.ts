import { apiClient } from "@/services/client";

// ─── Entities ─────────────────────────────────────────────────────────────────

/** Matches the backend AuditLog entity exactly */
export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entite: string;
  entite_id: string;
  details: string;
  ip_address: string;
  user_agent: string;
  hash_sha256: string;
  hash_precedent: string;
  horodatage: string; // ISO 8601
}

/** Response from GET /integrity/verify and GET /integrity/status */
export interface AuditIntegrityResult {
  checkedCount: number;
  invalidCount: number;
  invalidIds: string[];
  checkedAt: string; // ISO 8601
}

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  message?: string;
  meta?: Record<string, unknown>;
}

function unwrapData<T>(payload: T | ApiEnvelope<T>): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<T>).data as T;
  }
  return payload as T;
}

// ─── Query params ─────────────────────────────────────────────────────────────

export interface ListAuditLogsParams {
  user_id?: string;
  action?: string;
  entite?: string;
  entite_id?: string;
  dateMin?: string;  // ISO 8601
  dateMax?: string;  // ISO 8601
  page?: number;     // default: 1
  limit?: number;    // default: 20
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/audit/logs
 * Search and filter audit logs.
 */
export async function getAdminAuditLogs(
  params: ListAuditLogsParams = {}
): Promise<AuditLog[]> {
  const qs = new URLSearchParams();
  if (params.user_id)  qs.set("user_id",  params.user_id);
  if (params.action)   qs.set("action",   params.action);
  if (params.entite)   qs.set("entite",   params.entite);
  if (params.entite_id) qs.set("entite_id", params.entite_id);
  if (params.dateMin)  qs.set("dateMin",  params.dateMin);
  if (params.dateMax)  qs.set("dateMax",  params.dateMax);
  if (params.page  !== undefined) qs.set("page",  String(params.page));
  if (params.limit !== undefined) qs.set("limit", String(params.limit));

  const query = qs.toString() ? `?${qs.toString()}` : "";
  const payload = await apiClient<AuditLog[] | ApiEnvelope<AuditLog[]>>(`/api/v1/audit/logs${query}`, { method: "GET" });
  return unwrapData(payload);
}

/**
 * GET /api/v1/audit/logs/{id}
 * Get a single audit log by its ID.
 */
export async function getAdminAuditLogById(id: string): Promise<AuditLog> {
  const payload = await apiClient<AuditLog | ApiEnvelope<AuditLog>>(`/api/v1/audit/logs/${id}`, { method: "GET" });
  return unwrapData(payload);
}

/**
 * GET /api/v1/audit/logs/entite/{entite}/{entite_id}
 * Get audit history for a specific entity.
 */
export async function getAuditLogsByEntite(
  entite: string,
  entiteId: string
): Promise<AuditLog[]> {
  const payload = await apiClient<AuditLog[] | ApiEnvelope<AuditLog[]>>(
    `/api/v1/audit/logs/entite/${entite}/${entiteId}`,
    { method: "GET" }
  );
  return unwrapData(payload);
}

/**
 * GET /api/v1/integrity/verify
 * Trigger a manual integrity check of the audit chain.
 */
export async function verifyAdminAuditIntegrity(): Promise<AuditIntegrityResult> {
  const payload = await apiClient<AuditIntegrityResult | ApiEnvelope<AuditIntegrityResult>>(`/api/v1/integrity/verify`, {
    method: "GET",
  });
  return unwrapData(payload);
}

/**
 * GET /api/v1/integrity/status
 * Get the last integrity check report.
 */
export async function getAdminAuditIntegrityStatus(): Promise<AuditIntegrityResult> {
  const payload = await apiClient<AuditIntegrityResult | ApiEnvelope<AuditIntegrityResult>>(`/api/v1/integrity/status`, {
    method: "GET",
  });
  return unwrapData(payload);
}
