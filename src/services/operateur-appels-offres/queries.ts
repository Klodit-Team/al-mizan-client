import { useQuery } from "@tanstack/react-query";
import {
  getOperateurAppelOffreById,
  listOperateurAppelsOffres,
  getOperateurAoEligibilityCriteria,
  getOperateurAoDocuments,
  type OeAoItem,
  type OeAoEligibilityCriterion,
  type OeAoDocument,
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

export function useOperateurAoEligibilityCriteriaQuery(id: string) {
  return useQuery<OeAoEligibilityCriterion[], Error>({
    queryKey: operateurAppelsOffresKeys.eligibilityCriteria(id),
    queryFn: () => getOperateurAoEligibilityCriteria(id),
    enabled: Boolean(id),
  });
}

export function useOperateurAoDocumentsQuery(id: string) {
  return useQuery<OeAoDocument[], Error>({
    queryKey: operateurAppelsOffresKeys.documents(id),
    queryFn: () => getOperateurAoDocuments(id),
    enabled: Boolean(id),
  });
}
