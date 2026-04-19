export const operateurSoumissionsKeys = {
  all: ["operateur-soumissions"] as const,
  list: () => [...operateurSoumissionsKeys.all, "list"] as const,
  detail: (id: string) => [...operateurSoumissionsKeys.all, "detail", id] as const,
};
