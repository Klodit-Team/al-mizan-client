import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ProfileEntity,
  RoleEntity,
  AssignRoleDto,
  UserRoleEntity,
} from "@/components/dashboard/admin/users/types";
import {
  getAdminUserProfiles,
  getAdminRoles,
  getUserRoles,
  assignUserRole,
  createUserProfile,
  updateProfileByUserId,
  deleteProfile,
  type CreateProfileDto,
  type UpdateProfileDto,
} from "./api";
import { usersKeys } from "./keys";

export function useAdminUserProfilesQuery() {
  return useQuery<ProfileEntity[], Error>({
    queryKey: usersKeys.profilesList(),
    queryFn: getAdminUserProfiles,
  });
}

export function useAdminRolesQuery() {
  return useQuery<RoleEntity[], Error>({
    queryKey: usersKeys.rolesList(),
    queryFn: getAdminRoles,
  });
}

export function useUserRolesQuery(userId: string) {
  return useQuery<UserRoleEntity[], Error>({
    queryKey: usersKeys.userRoles(userId),
    queryFn: () => getUserRoles(userId),
    enabled: Boolean(userId),
  });
}

export function useCreateUserProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation<ProfileEntity, Error, CreateProfileDto>({
    mutationFn: createUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.profilesList() });
    },
  });
}

export function useUpdateUserProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation<ProfileEntity, Error, { userId: string; payload: UpdateProfileDto }>({
    mutationFn: ({ userId, payload }) => updateProfileByUserId(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.profilesList() });
    },
  });
}

export function useDeleteUserProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ deleted: boolean }, Error, string>({
    mutationFn: deleteProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.profilesList() });
    },
  });
}

export function useAssignUserRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation<UserRoleEntity, Error, AssignRoleDto>({
    mutationFn: assignUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}
