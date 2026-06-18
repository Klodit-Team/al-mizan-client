import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminGreAGreDemand,
  listAdminGreAGreDemands,
  validateAdminGreAGreDemand,
  type AdminGreAGreDemand,
  type AdminGreAGreListResponse,
  type ListAdminGreAGreParams,
  type ValidateAdminGreAGrePayload,
} from "./api";
import { greAGreAdminKeys } from "./keys";

export function useAdminGreAGreDemandsQuery(params: ListAdminGreAGreParams) {
  return useQuery<AdminGreAGreListResponse, Error>({
    queryKey: greAGreAdminKeys.list(params),
    queryFn: () => listAdminGreAGreDemands(params),
  });
}

export function useAdminGreAGreDemandQuery(id: string) {
  return useQuery<AdminGreAGreDemand, Error>({
    queryKey: greAGreAdminKeys.detail(id),
    queryFn: () => getAdminGreAGreDemand(id),
    enabled: Boolean(id),
  });
}

export function useValidateAdminGreAGreMutation() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { id: string; payload: ValidateAdminGreAGrePayload }>({
    mutationFn: ({ id, payload }) => validateAdminGreAGreDemand(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: greAGreAdminKeys.all });
      queryClient.invalidateQueries({ queryKey: greAGreAdminKeys.detail(id) });
    },
  });
}
