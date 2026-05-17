export const administratorDashboardKeys = {
  all: ["administrator-dashboard"] as const,
  details: () => [...administratorDashboardKeys.all, "details"] as const,
  stats: () => [...administratorDashboardKeys.all, "stats"] as const,
};
