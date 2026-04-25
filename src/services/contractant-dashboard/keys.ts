export const contractantDashboardKeys = {
  all: ["contractant-dashboard"] as const,
  details: () => [...contractantDashboardKeys.all, "details"] as const,
};
