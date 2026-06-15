export const operateurNotificationsKeys = {
  all: ["operateur-notifications"] as const,
  list: () => [...operateurNotificationsKeys.all, "list"] as const,
  unreadCount: () => [...operateurNotificationsKeys.all, "unread-count"] as const,
};
