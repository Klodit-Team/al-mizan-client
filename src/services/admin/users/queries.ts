import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ProfileEntity,
  RoleEntity,
  AssignRoleDto,
  UserRoleEntity,
} from "@/components/dashboard/admin/users/types";
import {
  getAdminRoles,
  getUserRoles,
  assignUserRole,
  removeUserRole,
  createRole,
  createUserProfile,
  updateProfileByUserId,
  deleteProfile,
  type CreateProfileDto,
  type UpdateProfileDto,
} from "./api";
import { usersKeys } from "./keys";

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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.userRoles(variables.userId) });
    },
  });
}

export function useRemoveUserRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ deleted: boolean }, Error, { userId: string; roleId: string }>({
    mutationFn: ({ userId, roleId }) => removeUserRole(userId, roleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.userRoles(variables.userId) });
    },
  });
}

export function useCreateRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation<RoleEntity, Error, { name: string; description: string }>({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.rolesList() });
    },
  });
}
