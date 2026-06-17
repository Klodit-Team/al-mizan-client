// src/services/public/public-appels-offres-queries.ts
import { useQuery } from "@tanstack/react-query";
import {
  listPublicAppelsOffres,
  getPublicAppelOffreById,
} from "./public-appels-offres-api";
import { type OeAoItem } from "@/services/operateur-appels-offres/api";

export const publicAppelsOffresKeys = {
  all: ["public-appels-offres"] as const,
  list: () => [...publicAppelsOffresKeys.all, "list"] as const,
  detail: (id: string) => [...publicAppelsOffresKeys.all, "detail", id] as const,
};

export function usePublicAppelsOffresQuery() {
  return useQuery<OeAoItem[], Error>({
    queryKey: publicAppelsOffresKeys.list(),
    queryFn: listPublicAppelsOffres,
  });
}

export function usePublicAppelOffreDetailQuery(id: string) {
  return useQuery<OeAoItem | null, Error>({
    queryKey: publicAppelsOffresKeys.detail(id),
    queryFn: () => getPublicAppelOffreById(id),
    enabled: Boolean(id),
  });
}