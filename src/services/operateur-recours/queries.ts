import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOperateurRecours,
  getOperateurRecoursById,
  listRecoursCreationOptions,
  listOperateurRecours,
  updateOperateurRecours,
  type CreateOperateurRecoursInput,
  type RecoursCreationOptions,
  type OperateurRecoursItem,
  type UpdateOperateurRecoursInput,
} from "./api";
import { operateurRecoursKeys } from "./keys";

export function useOperateurRecoursQuery() {
  return useQuery<OperateurRecoursItem[], Error>({
    queryKey: operateurRecoursKeys.list(),
    queryFn: listOperateurRecours,
  });
}

export function useOperateurRecoursDetailQuery(id: string) {
  return useQuery<OperateurRecoursItem | null, Error>({
    queryKey: operateurRecoursKeys.detail(id),
    queryFn: () => getOperateurRecoursById(id),
    enabled: Boolean(id),
  });
}

export function useRecoursCreationOptionsQuery() {
  return useQuery<RecoursCreationOptions, Error>({
    queryKey: [...operateurRecoursKeys.all, "creation-options"],
    queryFn: listRecoursCreationOptions,
  });
}

export function useCreateOperateurRecoursMutation() {
  const queryClient = useQueryClient();

  return useMutation<OperateurRecoursItem, Error, CreateOperateurRecoursInput>({
    mutationFn: createOperateurRecours,
    onSuccess: async (created) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: operateurRecoursKeys.list() }),
        queryClient.invalidateQueries({ queryKey: operateurRecoursKeys.detail(created.id) }),
      ]);
    },
  });
}

export function useUpdateOperateurRecoursMutation() {
  const queryClient = useQueryClient();

  return useMutation<OperateurRecoursItem, Error, UpdateOperateurRecoursInput>({
    mutationFn: updateOperateurRecours,
    onSuccess: async (updated) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: operateurRecoursKeys.list() }),
        queryClient.invalidateQueries({ queryKey: operateurRecoursKeys.detail(updated.id) }),
      ]);
    },
  });
}
