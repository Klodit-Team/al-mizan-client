export const operateurRecoursKeys = {
  all: ["operateur-recours"] as const,
  list: () => [...operateurRecoursKeys.all, "list"] as const,
  detail: (id: string) => [...operateurRecoursKeys.all, "detail", id] as const,
};
