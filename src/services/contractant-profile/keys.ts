export const contractantProfileKeys = {
  all: ["contractant-profile"] as const,
  details: () => [...contractantProfileKeys.all, "details"] as const,
};
