export const organisationsKeys = {
  all: ["organisations"] as const,
  lists: () => [...organisationsKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...organisationsKeys.lists(), filters] as const,
  details: () => [...organisationsKeys.all, "detail"] as const,
  detail: (id: string) => [...organisationsKeys.details(), id] as const,
};
