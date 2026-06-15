export const incidentsKeys = {
  all: ["incidents"] as const,
  lists: () => [...incidentsKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...incidentsKeys.lists(), filters] as const,
  details: () => [...incidentsKeys.all, "detail"] as const,
  detail: (id: string) => [...incidentsKeys.details(), id] as const,
};
