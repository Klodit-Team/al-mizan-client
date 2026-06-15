import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getContractantProfile,
  updateContractantProfile,
  type ContractantProfile,
} from "./api";
import { contractantProfileKeys } from "./keys";

export function useContractantProfileQuery() {
  return useQuery<ContractantProfile, Error>({
    queryKey: contractantProfileKeys.details(),
    queryFn: getContractantProfile,
  });
}

export function useUpdateContractantProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation<ContractantProfile, Error, ContractantProfile>({
    mutationFn: updateContractantProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: contractantProfileKeys.details() });
    },
  });
}
