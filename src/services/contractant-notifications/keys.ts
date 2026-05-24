export const contractantNotificationsKeys = {
  all: ["contractant-notifications"] as const,
  list: () => [...contractantNotificationsKeys.all, "list"] as const,
  unreadCount: () => [...contractantNotificationsKeys.all, "unread-count"] as const,
};
