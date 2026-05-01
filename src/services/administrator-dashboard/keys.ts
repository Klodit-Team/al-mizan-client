export const administratorDashboardKeys = {
  all: ["administrator-dashboard"] as const,
  stats: () => [...administratorDashboardKeys.all, "stats"] as const,
};
