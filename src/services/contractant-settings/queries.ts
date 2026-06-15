import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getContractantSettings,
  updateContractantSettings,
  type ContractantSettings,
} from "./api";
import { contractantSettingsKeys } from "./keys";

export function useContractantSettingsQuery() {
  return useQuery<ContractantSettings, Error>({
    queryKey: contractantSettingsKeys.details(),
    queryFn: getContractantSettings,
  });
}

export function useUpdateContractantSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation<ContractantSettings, Error, Partial<ContractantSettings>>({
    mutationFn: updateContractantSettings,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: contractantSettingsKeys.details() });
    },
  });
}
