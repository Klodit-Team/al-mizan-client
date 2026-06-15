import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminAuditLogs,
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
