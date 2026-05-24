import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getContractantSecurityOverview,
  startContractantMfaSetup,
  confirmContractantMfaSetup,
  disableContractantMfa,
  revokeContractantSession,
  revokeAllOtherContractantSessions,
  type ContractantSecurityOverview,
  type MfaSetupData,
} from "./api";
import { contractantSecurityKeys } from "./keys";

export function useContractantSecurityOverviewQuery() {
  return useQuery<ContractantSecurityOverview, Error>({
    queryKey: contractantSecurityKeys.overview(),
    queryFn: getContractantSecurityOverview,
  });
}

export function useStartMfaSetupMutation() {
  return useMutation<MfaSetupData, Error, void>({
    mutationFn: startContractantMfaSetup,
  });
}

export function useConfirmMfaSetupMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: confirmContractantMfaSetup,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: contractantSecurityKeys.overview() });
    },
  });
}

export function useDisableMfaMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: disableContractantMfa,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: contractantSecurityKeys.overview() });
    },
  });
}

export function useRevokeSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: revokeContractantSession,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: contractantSecurityKeys.overview() });
    },
  });
}

export function useRevokeAllOtherSessionsMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: revokeAllOtherContractantSessions,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: contractantSecurityKeys.overview() });
    },
  });
}
