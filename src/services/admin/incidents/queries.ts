import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminIncidents,
  resolveAdminIncident,
  updateAdminIncidentStatut,
  type AIIncident,
  type ListIncidentsParams,
  type ResolveIncidentDto,
  type IncidentStatut,
} from "./api";
import { incidentsKeys } from "./keys";

export function useIncidentsQuery(params: ListIncidentsParams) {
  return useQuery<AIIncident[], Error>({
    queryKey: incidentsKeys.list(params),
    queryFn: () => getAdminIncidents(params),
  });
}

export function useUpdateIncidentStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation<AIIncident, Error, { id: string; statut: IncidentStatut }>({
    mutationFn: ({ id, statut }) => updateAdminIncidentStatut(id, statut),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incidentsKeys.all });
    },
  });
}

export function useResolveIncidentMutation() {
  const queryClient = useQueryClient();

  return useMutation<AIIncident, Error, { id: string; resolutionNotes: string }>({
    mutationFn: ({ id, resolutionNotes }) => resolveAdminIncident(id, { resolution_notes: resolutionNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incidentsKeys.all });
    },
  });
}
