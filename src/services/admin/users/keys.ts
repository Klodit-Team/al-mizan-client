export const usersKeys = {
  all: ["users"] as const,
  profiles: () => [...usersKeys.all, "profiles"] as const,
  profilesList: () => [...usersKeys.profiles(), "list"] as const,
  roles: () => [...usersKeys.all, "roles"] as const,
  rolesList: () => [...usersKeys.roles(), "list"] as const,
  userRoles: (userId: string) => [...usersKeys.all, "userRoles", userId] as const,
};
