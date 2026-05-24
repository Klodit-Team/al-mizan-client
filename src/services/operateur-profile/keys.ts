export const operateurProfileKeys = {
  all: ["operateur-profile"] as const,
  details: () => [...operateurProfileKeys.all, "details"] as const,
  security: () => [...operateurProfileKeys.all, "security"] as const,
};
