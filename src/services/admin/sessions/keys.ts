export const sessionsKeys = {
  all: ["sessions"] as const,
  lists: () => [...sessionsKeys.all, "list"] as const,
  list: () => [...sessionsKeys.lists()] as const,
};
