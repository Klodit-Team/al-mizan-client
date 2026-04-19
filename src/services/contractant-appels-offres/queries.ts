import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getContractantAppelOffreById,
  updateContractantAppelOffreStatus,
  type ServiceContractantApiStatus,
  type ServiceContractantTenderDetail,
  type ServiceContractantTenderStatus,
} from "./api";
import { contractantAppelsOffresKeys } from "./keys";

export function useContractantAppelOffreDetailQuery(id: string) {
  return useQuery<ServiceContractantTenderDetail | null, Error>({
    queryKey: contractantAppelsOffresKeys.detail(id),
    queryFn: () => getContractantAppelOffreById(id),
    enabled: Boolean(id),
  });
}

export function useContractantAppelOffreStatusMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation<
    ServiceContractantTenderStatus,
    Error,
    ServiceContractantApiStatus
  >({
    mutationFn: (status) => updateContractantAppelOffreStatus(id, status),
    onSuccess: (nextStatus) => {
      queryClient.setQueryData<ServiceContractantTenderDetail | null>(
        contractantAppelsOffresKeys.detail(id),
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            status: nextStatus,
          };
        },
      );

      queryClient.invalidateQueries({
        queryKey: contractantAppelsOffresKeys.list(),
      });
    },
  });
}
