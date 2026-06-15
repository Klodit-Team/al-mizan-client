export const operateurAppelsOffresKeys = {
  all: ["operateur-appels-offres"] as const,
  list: () => [...operateurAppelsOffresKeys.all, "list"] as const,
  detail: (id: string) => [...operateurAppelsOffresKeys.all, "detail", id] as const,
  eligibilityCriteria: (id: string) => [...operateurAppelsOffresKeys.all, "eligibility", id] as const,
  documents: (id: string) => [...operateurAppelsOffresKeys.all, "documents", id] as const,
};
