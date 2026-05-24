export const contractantGreAGreKeys = {
  all: ["contractant-gre-a-gre"] as const,
  list: () => [...contractantGreAGreKeys.all, "list"] as const,
  detail: (id: string) => [...contractantGreAGreKeys.all, "detail", id] as const,
};
