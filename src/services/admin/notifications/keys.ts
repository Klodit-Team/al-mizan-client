export const notificationsKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationsKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...notificationsKeys.lists(), filters] as const,
  unreadCount: () => [...notificationsKeys.all, "unreadCount"] as const,
};
