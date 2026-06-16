export const operateursKeys = {
  all: ["operateurs"] as const,
  lists: () => [...operateursKeys.all, "list"] as const,
  list: (page: number, limit: number) => [...operateursKeys.lists(), { page, limit }] as const,
  details: () => [...operateursKeys.all, "detail"] as const,
  detail: (id: string) => [...operateursKeys.details(), id] as const,
};
