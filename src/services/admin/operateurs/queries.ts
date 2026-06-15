import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminOperateurs,
  blacklistAdminOperateur,
  unblacklistAdminOperateur,
  type AdminOperateur,
  type OperateurEconomiqueEntity,
} from "./api";
import { operateursKeys } from "./keys";

export function useOperateursQuery() {
  return useQuery<AdminOperateur[], Error>({
    queryKey: operateursKeys.list(),
    queryFn: getAdminOperateurs,
  });
}

export function useBlacklistOperateurMutation() {
  const queryClient = useQueryClient();

  return useMutation<OperateurEconomiqueEntity, Error, { oeId: string; reason: string }>({
    mutationFn: ({ oeId, reason }) => blacklistAdminOperateur(oeId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operateursKeys.list() });
    },
  });
}

export function useUnblacklistOperateurMutation() {
  const queryClient = useQueryClient();

  return useMutation<OperateurEconomiqueEntity, Error, string>({
    mutationFn: unblacklistAdminOperateur,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operateursKeys.list() });
    },
  });
}
