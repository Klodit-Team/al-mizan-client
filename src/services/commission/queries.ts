import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCommissionEvaluationsOverview,
  getCommissionEvaluationSubmissions,
  getCommissionEvaluationCriteria,
  saveCommissionEvaluationScores,
  getCommissionDocuments,
  setCommissionDocumentDecision,
  getCommissionClassement,
  setCommissionClassementDecision,
  getCommissionPreDechiffrement,
  getCommissionDechiffrement,
  unlockCommissionDechiffrement,
  type CommissionEvaluationOverviewItem,
  type CommissionEvaluationSubmission,
  type CommissionEvaluationCriterion,
  type CommissionDocumentItem,
  type CommissionDocumentDecisionPayload,
  type CommissionClassementRow,
  type CommissionClassementDecisionPayload,
  type CommissionPreDechiffrementData,
  type CommissionDechiffrementData,
  type CommissionScoresPayload,
} from "./api";
import { commissionKeys } from "./keys";

export function useCommissionEvaluationsOverviewQuery() {
  return useQuery<CommissionEvaluationOverviewItem[], Error>({
    queryKey: commissionKeys.evaluationsOverview(),
    queryFn: getCommissionEvaluationsOverview,
  });
}

export function useCommissionEvaluationSubmissionsQuery(aoId: string) {
  return useQuery<CommissionEvaluationSubmission[], Error>({
    queryKey: commissionKeys.evaluationSubmissions(aoId),
    queryFn: () => getCommissionEvaluationSubmissions(aoId),
    enabled: Boolean(aoId),
  });
}

export function useCommissionEvaluationCriteriaQuery(aoId: string) {
  return useQuery<CommissionEvaluationCriterion[], Error>({
    queryKey: commissionKeys.evaluationCriteria(aoId),
    queryFn: () => getCommissionEvaluationCriteria(aoId),
    enabled: Boolean(aoId),
  });
}

export function useSaveCommissionScoresMutation(evaluationId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, CommissionScoresPayload>({
    mutationFn: (payload) => saveCommissionEvaluationScores(evaluationId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: commissionKeys.all });
    },
  });
}

export function useCommissionDocumentsQuery(soumissionId: string) {
  return useQuery<CommissionDocumentItem[], Error>({
    queryKey: commissionKeys.documents(soumissionId),
    queryFn: () => getCommissionDocuments(soumissionId),
    enabled: Boolean(soumissionId),
  });
}

export function useSetCommissionDocumentDecisionMutation(soumissionId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { documentId: string; payload: CommissionDocumentDecisionPayload }>({
    mutationFn: ({ documentId, payload }) => setCommissionDocumentDecision(documentId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: commissionKeys.documents(soumissionId) });
    },
  });
}

export function useCommissionClassementQuery(aoId: string) {
  return useQuery<CommissionClassementRow[], Error>({
    queryKey: commissionKeys.classement(aoId),
    queryFn: () => getCommissionClassement(aoId),
    enabled: Boolean(aoId),
  });
}

export function useSetCommissionClassementDecisionMutation(aoId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, CommissionClassementDecisionPayload>({
    mutationFn: (payload) => setCommissionClassementDecision(aoId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: commissionKeys.classement(aoId) });
    },
  });
}

export function useCommissionPreDechiffrementQuery(offreId: string) {
  return useQuery<CommissionPreDechiffrementData, Error>({
    queryKey: commissionKeys.preDechiffrement(offreId),
    queryFn: () => getCommissionPreDechiffrement(offreId),
    enabled: Boolean(offreId),
  });
}

export function useCommissionDechiffrementQuery(offreId: string) {
  return useQuery<CommissionDechiffrementData, Error>({
    queryKey: commissionKeys.dechiffrement(offreId),
    queryFn: () => getCommissionDechiffrement(offreId),
    enabled: Boolean(offreId),
  });
}

export function useUnlockCommissionDechiffrementMutation(offreId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => unlockCommissionDechiffrement(offreId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: commissionKeys.dechiffrement(offreId) });
    },
  });
}
