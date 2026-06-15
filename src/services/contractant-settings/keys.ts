export const contractantSettingsKeys = {
  all: ["contractant-settings"] as const,
  details: () => [...contractantSettingsKeys.all, "details"] as const,
};
