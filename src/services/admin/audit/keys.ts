export const auditKeys = {
  all: ["audit"] as const,
  lists: () => [...auditKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...auditKeys.lists(), filters] as const,
  integrityStatus: () => [...auditKeys.all, "integrityStatus"] as const,
};
