import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminOperateurs,
  getOperateurById,
  blacklistAdminOperateur,
  unblacklistAdminOperateur,
  type OperateurListResponse,
  type OperateurEconomiqueEntity,
} from "./api";
import { operateursKeys } from "./keys";

export function useOperateursQuery(page: number = 1, limit: number = 20) {
  return useQuery<OperateurListResponse, Error>({
    queryKey: operateursKeys.list(page, limit),
    queryFn: () => getAdminOperateurs(page, limit),
  });
}

export function useOperateurDetailQuery(id: string) {
  return useQuery<OperateurEconomiqueEntity, Error>({
    queryKey: operateursKeys.detail(id),
    queryFn: () => getOperateurById(id),
    enabled: Boolean(id),
  });
}

export function useBlacklistOperateurMutation() {
  const queryClient = useQueryClient();

  return useMutation<OperateurEconomiqueEntity, Error, { oeId: string; reason: string }>({
    mutationFn: ({ oeId, reason }) => blacklistAdminOperateur(oeId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operateursKeys.all });
    },
  });
}

export function useUnblacklistOperateurMutation() {
  const queryClient = useQueryClient();

  return useMutation<OperateurEconomiqueEntity, Error, string>({
    mutationFn: unblacklistAdminOperateur,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operateursKeys.all });
    },
  });
}
