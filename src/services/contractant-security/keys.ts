export const contractantSecurityKeys = {
  all: ["contractant-security"] as const,
  overview: () => [...contractantSecurityKeys.all, "overview"] as const,
};
