export const contractantAppelsOffresKeys = {
  all: ["contractant-appels-offres"] as const,
  list: () => [...contractantAppelsOffresKeys.all, "list"] as const,
  detail: (id: string) => [...contractantAppelsOffresKeys.all, "detail", id] as const,
};
