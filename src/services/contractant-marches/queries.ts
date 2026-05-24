import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listContractantMarches,
  getContractantMarcheById,
  updateContractantMarcheStatus,
  type MarcheListItem,
  type MarcheDetail,
  type MarcheNextStatus,
} from "./api";
import { contractantMarchesKeys } from "./keys";

export function useContractantMarchesQuery() {
  return useQuery<MarcheListItem[], Error>({
    queryKey: contractantMarchesKeys.list(),
    queryFn: listContractantMarches,
  });
}

export function useContractantMarcheDetailQuery(id: string) {
  return useQuery<MarcheDetail | null, Error>({
    queryKey: contractantMarchesKeys.detail(id),
    queryFn: () => getContractantMarcheById(id),
    enabled: Boolean(id),
  });
}

export function useUpdateMarcheStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation<MarcheDetail, Error, { id: string; status: MarcheNextStatus }>({
    mutationFn: ({ id, status }) => updateContractantMarcheStatus(id, status),
    onSuccess: async (_data, { id }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: contractantMarchesKeys.list() }),
        queryClient.invalidateQueries({ queryKey: contractantMarchesKeys.detail(id) }),
      ]);
    },
  });
}
