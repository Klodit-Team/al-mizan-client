import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listOrganisations,
  verifyOrganisation,
  updateOrganisation,
  deleteOrganisation,
  type PaginatedOrganisations,
  type OrganisationEntity,
  type ListOrganisationsParams,
} from "./api";
import { organisationsKeys } from "./keys";

export function useOrganisationsQuery(params: ListOrganisationsParams) {
  return useQuery<PaginatedOrganisations, Error>({
    queryKey: organisationsKeys.list(params),
    queryFn: () => listOrganisations(params),
  });
}

export function useVerifyOrganisationMutation() {
  const queryClient = useQueryClient();

  return useMutation<OrganisationEntity, Error, string>({
    mutationFn: (id) => verifyOrganisation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organisationsKeys.lists() });
    },
  });
}

export function useUpdateOrganisationMutation() {
  const queryClient = useQueryClient();

  return useMutation<OrganisationEntity, Error, { id: string; payload: Record<string, any> }>({
    mutationFn: ({ id, payload }) => updateOrganisation(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organisationsKeys.lists() });
    },
  });
}

export function useDeleteOrganisationMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ deleted: boolean }, Error, string>({
    mutationFn: (id) => deleteOrganisation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organisationsKeys.lists() });
    },
  });
}
