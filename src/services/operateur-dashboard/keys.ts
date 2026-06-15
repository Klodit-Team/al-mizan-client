export const operateurDashboardKeys = {
  all: ["operateur-dashboard"] as const,
  details: () => [...operateurDashboardKeys.all, "details"] as const,
  activities: () => [...operateurDashboardKeys.all, "activities"] as const,
};
