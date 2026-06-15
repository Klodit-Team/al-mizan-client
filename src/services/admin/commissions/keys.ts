export const commissionsKeys = {
  all: ["commissions"] as const,
  lists: () => [...commissionsKeys.all, "list"] as const,
  list: () => [...commissionsKeys.lists()] as const,
  details: () => [...commissionsKeys.all, "detail"] as const,
  detail: (id: string) => [...commissionsKeys.details(), id] as const,
};
