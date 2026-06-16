import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminAuditLogs,
  getAdminAuditLogById,
  getAdminAuditIntegrityStatus,
  verifyAdminAuditIntegrity,
  type ListAuditLogsParams,
  type AuditLog,
  type AuditIntegrityResult,
} from "./api";
import { auditKeys } from "./keys";

export function useAuditQuery(params: ListAuditLogsParams) {
  return useQuery<AuditLog[], Error>({
    queryKey: auditKeys.list(params),
    queryFn: () => getAdminAuditLogs(params),
  });
}

export function useAuditDetailQuery(id: string) {
  return useQuery<AuditLog, Error>({
    queryKey: [...auditKeys.all, "detail", id],
    queryFn: () => getAdminAuditLogById(id),
    enabled: Boolean(id),
  });
}

export function useIntegrityStatusQuery() {
  return useQuery<AuditIntegrityResult, Error>({
    queryKey: auditKeys.integrityStatus(),
    queryFn: () => getAdminAuditIntegrityStatus(),
  });
}

export function useVerifyIntegrityMutation() {
  const queryClient = useQueryClient();

  return useMutation<AuditIntegrityResult, Error, void>({
    mutationFn: () => verifyAdminAuditIntegrity(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auditKeys.integrityStatus() });
    },
  });
}
