import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCommissionEvaluationsOverview,
  getCommissionEvaluationByContext,
  getCommissionEvaluationSubmissions,
  getCommissionAoSubmissions,
  getCommissionEvaluationCriteria,
  getCommissionAoCriteria,
  getCommissionAoDetail,
  getCommissionEvaluationNotes,
  getCommissionAoAnomalies,
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
  type CommissionAoDetail,
  type CommissionEvaluationNote,
  type CommissionAoAnomalies,
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

export function useCommissionEvaluationContextQuery({
  commissionId,
  aoId,
  evaluationId,
}: {
  commissionId?: string;
  aoId?: string;
  evaluationId?: string;
}) {
  return useQuery<CommissionEvaluationOverviewItem | null, Error>({
    queryKey: commissionKeys.evaluationContext(commissionId ?? "", aoId ?? evaluationId ?? ""),
    queryFn: () => getCommissionEvaluationByContext({ commissionId, aoId, evaluationId }),
    enabled: Boolean(commissionId || aoId || evaluationId),
  });
}

export function useCommissionEvaluationSubmissionsQuery(evaluationId: string) {
  return useQuery<CommissionEvaluationSubmission[], Error>({
    queryKey: commissionKeys.evaluationSubmissions(evaluationId),
    queryFn: () => getCommissionEvaluationSubmissions(evaluationId),
    enabled: Boolean(evaluationId),
  });
}

export function useCommissionAoSubmissionsQuery(aoId: string, enabled = true) {
  return useQuery<CommissionEvaluationSubmission[], Error>({
    queryKey: commissionKeys.aoSubmissions(aoId),
    queryFn: () => getCommissionAoSubmissions(aoId),
    enabled: Boolean(aoId) && enabled,
  });
}

export function useCommissionEvaluationCriteriaQuery(evaluationId: string) {
  return useQuery<CommissionEvaluationCriterion[], Error>({
    queryKey: commissionKeys.evaluationCriteria(evaluationId),
    queryFn: () => getCommissionEvaluationCriteria(evaluationId),
    enabled: Boolean(evaluationId),
  });
}

export function useCommissionAoCriteriaQuery(aoId: string, enabled = true) {
  return useQuery<CommissionEvaluationCriterion[], Error>({
    queryKey: commissionKeys.aoCriteria(aoId),
    queryFn: () => getCommissionAoCriteria(aoId),
    enabled: Boolean(aoId) && enabled,
  });
}

export function useCommissionAoDetailQuery(aoId: string, enabled = true) {
  return useQuery<CommissionAoDetail | null, Error>({
    queryKey: [...commissionKeys.all, "ao-detail", aoId] as const,
    queryFn: () => getCommissionAoDetail(aoId),
    enabled: Boolean(aoId) && enabled,
  });
}

export function useCommissionEvaluationNotesQuery(
  evaluationId: string,
  submissionId: string,
  enabled = true,
) {
  return useQuery<CommissionEvaluationNote[], Error>({
    queryKey: commissionKeys.evaluationNotes(evaluationId, submissionId),
    queryFn: () => getCommissionEvaluationNotes(evaluationId, submissionId),
    enabled: Boolean(evaluationId && submissionId) && enabled,
  });
}

export function useCommissionAoAnomaliesQuery(aoId: string, enabled = true) {
  return useQuery<CommissionAoAnomalies, Error>({
    queryKey: commissionKeys.aoAnomalies(aoId),
    queryFn: () => getCommissionAoAnomalies(aoId),
    enabled: Boolean(aoId) && enabled,
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
