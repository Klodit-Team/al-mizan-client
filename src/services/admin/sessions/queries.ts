import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listActiveSessions,
  revokeSession,
  type ActiveSession,
} from "./api";
import { sessionsKeys } from "./keys";

export function useActiveSessionsQuery() {
  return useQuery<ActiveSession[], Error>({
    queryKey: sessionsKeys.list(),
    queryFn: listActiveSessions,
  });
}

export function useRevokeSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionsKeys.list() });
    },
  });
}
