import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listCommissionsMarche,
  createCommissionMarche,
  updateCommissionMarche,
  deleteCommissionMarche,
  changeCommissionMarcheStatut,
  getCommissionMarcheById,
  type PaginatedCommissions,
  type CommissionMarche,
  type CommissionMarcheDto,
  type CommissionStatut,
  type ListCommissionsParams,
} from "./api";
import { commissionsKeys } from "./keys";

export function useCommissionsQuery() {
  return useQuery<PaginatedCommissions, Error>({
    queryKey: commissionsKeys.list(),
    queryFn: () => listCommissionsMarche(),
  });
}

export function useCommissionDetailQuery(id: string) {
  return useQuery<CommissionMarche, Error>({
    queryKey: commissionsKeys.detail(id),
    queryFn: () => getCommissionMarcheById(id),
    enabled: !!id,
  });
}

export function useCreateCommissionMutation() {
  const queryClient = useQueryClient();

  return useMutation<CommissionMarche, Error, CommissionMarcheDto>({
    mutationFn: (payload) => createCommissionMarche(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commissionsKeys.all });
    },
  });
}

export function useUpdateCommissionMutation() {
  const queryClient = useQueryClient();

  return useMutation<CommissionMarche, Error, { id: string; payload: CommissionMarcheDto }>({
    mutationFn: ({ id, payload }) => updateCommissionMarche(id, payload),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(commissionsKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: commissionsKeys.all });
    },
  });
}

export function useDeleteCommissionMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteCommissionMarche(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commissionsKeys.all });
    },
  });
}

export function useUpdateCommissionStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation<CommissionMarche, Error, { id: string; status: CommissionStatut }>({
    mutationFn: ({ id, status }) => changeCommissionMarcheStatut(id, status),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(commissionsKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: commissionsKeys.all });
    },
  });
}
