export const contractantMarchesKeys = {
  all: ["contractant-marches"] as const,
  list: () => [...contractantMarchesKeys.all, "list"] as const,
  detail: (id: string) => [...contractantMarchesKeys.all, "detail", id] as const,
};
