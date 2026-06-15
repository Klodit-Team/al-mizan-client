export const adminProfileKeys = {
  all: ["admin-profile"] as const,
  details: () => [...adminProfileKeys.all, "details"] as const,
};
