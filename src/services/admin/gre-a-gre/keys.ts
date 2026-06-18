export const greAGreAdminKeys = {
  all: ["admin", "gre-a-gre"] as const,
  lists: () => [...greAGreAdminKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...greAGreAdminKeys.lists(), filters] as const,
  details: () => [...greAGreAdminKeys.all, "detail"] as const,
  detail: (id: string) => [...greAGreAdminKeys.details(), id] as const,
};
