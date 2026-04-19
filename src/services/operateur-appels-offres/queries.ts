import { useQuery } from "@tanstack/react-query";
import {
  getOperateurAppelOffreById,
  listOperateurAppelsOffres,
  type OeAoItem,
} from "./api";
import { operateurAppelsOffresKeys } from "./keys";

export function useOperateurAppelsOffresQuery() {
  return useQuery<OeAoItem[], Error>({
    queryKey: operateurAppelsOffresKeys.list(),
    queryFn: listOperateurAppelsOffres,
  });
}

export function useOperateurAppelOffreDetailQuery(id: string) {
  return useQuery<OeAoItem | null, Error>({
    queryKey: operateurAppelsOffresKeys.detail(id),
    queryFn: () => getOperateurAppelOffreById(id),
    enabled: Boolean(id),
  });
}
