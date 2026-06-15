export const operateursKeys = {
  all: ["operateurs"] as const,
  lists: () => [...operateursKeys.all, "list"] as const,
  list: () => [...operateursKeys.lists()] as const,
};
