import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminProfile,
  updateAdminProfile,
  type AdminProfileEntity,
  type UpdateAdminProfileInput,
} from "./api";
import { adminProfileKeys } from "./keys";

export function useAdminProfileQuery(userId: string) {
  return useQuery<AdminProfileEntity, Error>({
    queryKey: adminProfileKeys.details(),
    queryFn: () => getAdminProfile(userId),
    enabled: Boolean(userId),
  });
}

export function useUpdateAdminProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation<AdminProfileEntity, Error, { userId: string; payload: UpdateAdminProfileInput }>({
    mutationFn: ({ userId, payload }) => updateAdminProfile(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProfileKeys.details() });
    },
  });
}
