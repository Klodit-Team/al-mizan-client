import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getOperateurSoumissionById,
  listOperateurSoumissions,
  submitOperateurSoumissionWorkflow,
  type CreateSoumissionWorkflowInput,
  type OeSoumissionDetailItem,
  type OeSoumissionListItem,
  type SoumissionWorkflowResult,
} from "./api";
import { operateurSoumissionsKeys } from "./keys";

export function useOperateurSoumissionsQuery() {
  return useQuery<OeSoumissionListItem[], Error>({
    queryKey: operateurSoumissionsKeys.list(),
    queryFn: listOperateurSoumissions,
  });
}

export function useOperateurSoumissionDetailQuery(id: string) {
  return useQuery<OeSoumissionDetailItem | null, Error>({
    queryKey: operateurSoumissionsKeys.detail(id),
    queryFn: () => getOperateurSoumissionById(id),
    enabled: Boolean(id),
  });
}

export function useSubmitOperateurSoumissionWorkflowMutation() {
  const queryClient = useQueryClient();

  return useMutation<SoumissionWorkflowResult, Error, CreateSoumissionWorkflowInput>({
    mutationFn: submitOperateurSoumissionWorkflow,
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: operateurSoumissionsKeys.list() }),
        queryClient.invalidateQueries({ queryKey: operateurSoumissionsKeys.detail(result.soumissionId) }),
      ]);
    },
  });
}
