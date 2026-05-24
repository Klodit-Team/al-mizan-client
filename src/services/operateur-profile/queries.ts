import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getOperateurProfile,
  updateOperateurProfile,
  getOperateurSecurityOverview,
  revokeOperateurSession,
  revokeAllOtherOperateurSessions,
  type OperateurProfile,
  type OperateurSecurityOverview,
} from "./api";
import { operateurProfileKeys } from "./keys";

export function useOperateurProfileQuery() {
  return useQuery<OperateurProfile, Error>({
    queryKey: operateurProfileKeys.details(),
    queryFn: getOperateurProfile,
  });
}

export function useUpdateOperateurProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation<OperateurProfile, Error, Partial<OperateurProfile>>({
    mutationFn: updateOperateurProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: operateurProfileKeys.details() });
    },
  });
}

export function useOperateurSecurityOverviewQuery() {
  return useQuery<OperateurSecurityOverview, Error>({
    queryKey: operateurProfileKeys.security(),
    queryFn: getOperateurSecurityOverview,
  });
}

export function useRevokeOperateurSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: revokeOperateurSession,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: operateurProfileKeys.security() });
    },
  });
}

export function useRevokeAllOtherOperateurSessionsMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: revokeAllOtherOperateurSessions,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: operateurProfileKeys.security() });
    },
  });
}
