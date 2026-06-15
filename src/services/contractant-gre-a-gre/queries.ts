import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listGreAGreRequests,
  getGreAGreRequestById,
  submitGreAGreRequest,
  resubmitGreAGreRequest,
  type GreAGreRequestListItem,
  type GreAGreRequestDetail,
  type SubmitGreAGreRequestPayload,
} from "./api";
import { contractantGreAGreKeys } from "./keys";

export function useGreAGreRequestsQuery() {
  return useQuery<GreAGreRequestListItem[], Error>({
    queryKey: contractantGreAGreKeys.list(),
    queryFn: listGreAGreRequests,
  });
}

export function useGreAGreRequestDetailQuery(id: string) {
  return useQuery<GreAGreRequestDetail | null, Error>({
    queryKey: contractantGreAGreKeys.detail(id),
    queryFn: () => getGreAGreRequestById(id),
    enabled: Boolean(id),
  });
}

export function useSubmitGreAGreRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation<GreAGreRequestDetail, Error, SubmitGreAGreRequestPayload>({
    mutationFn: submitGreAGreRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: contractantGreAGreKeys.list() });
    },
  });
}

export function useResubmitGreAGreRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation<GreAGreRequestDetail, Error, { id: string; payload: SubmitGreAGreRequestPayload }>({
    mutationFn: ({ id, payload }) => resubmitGreAGreRequest(id, payload),
    onSuccess: async (_data, { id }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: contractantGreAGreKeys.list() }),
        queryClient.invalidateQueries({ queryKey: contractantGreAGreKeys.detail(id) }),
      ]);
    },
  });
}
