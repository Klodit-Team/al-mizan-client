import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listServiceContractantTenderSubmissions,
  getServiceContractantTenderSubmissionById,
  listServiceContractantTenderEvaluationPhases,
  getServiceContractantTenderEvaluationPhaseDetail,
  validateServiceContractantTenderEvaluationPhase,
  getServiceContractantTenderAttributionOverview,
  pronounceServiceContractantProvisionalAttribution,
  confirmServiceContractantDefinitiveAttribution,
  listServiceContractantTenderRecours,
  getServiceContractantTenderRecoursById,
  listServiceContractantTenderAvis,
  getServiceContractantTenderAvisById,
  saveServiceContractantTenderAvisDraft,
  publishServiceContractantTenderAvis,
  updateServiceContractantTenderAvis,
  publishServiceContractantTenderAvisById,
  deleteServiceContractantTenderAvis,
  type ServiceContractantTenderSubmissionListItem,
  type ServiceContractantTenderSubmissionDetail,
  type TenderEvaluationPhaseOverviewItem,
  type ServiceContractantTenderEvaluationPhaseDetail,
  type TenderEvaluationPhase,
  type ServiceContractantTenderAttributionOverview,
  type PronounceProvisionalAttributionPayload,
  type ConfirmDefinitiveAttributionPayload,
  type ServiceContractantTenderRecoursListItem,
  type ServiceContractantTenderRecoursDetail,
  type TenderAvisItem,
  type SaveTenderAvisPayload,
} from "./api";
import { contractantTendersKeys } from "./keys";

// ─── Soumissions ─────────────────────────────────────────────────────────────

export function useContractantTenderSubmissionsQuery(aoId: string) {
  return useQuery<ServiceContractantTenderSubmissionListItem[], Error>({
    queryKey: contractantTendersKeys.submissions(aoId),
    queryFn: () => listServiceContractantTenderSubmissions(aoId),
    enabled: Boolean(aoId),
  });
}

export function useContractantTenderSubmissionDetailQuery(aoId: string, submissionId: string) {
  return useQuery<ServiceContractantTenderSubmissionDetail | null, Error>({
    queryKey: contractantTendersKeys.submissionDetail(aoId, submissionId),
    queryFn: () => getServiceContractantTenderSubmissionById(aoId, submissionId),
    enabled: Boolean(aoId) && Boolean(submissionId),
  });
}

// ─── Evaluation ──────────────────────────────────────────────────────────────

export function useContractantTenderEvaluationPhasesQuery(aoId: string) {
  return useQuery<TenderEvaluationPhaseOverviewItem[], Error>({
    queryKey: contractantTendersKeys.evaluationPhases(aoId),
    queryFn: () => listServiceContractantTenderEvaluationPhases(aoId),
    enabled: Boolean(aoId),
  });
}

export function useContractantTenderEvaluationPhaseDetailQuery(aoId: string, phase: TenderEvaluationPhase) {
  return useQuery<ServiceContractantTenderEvaluationPhaseDetail | null, Error>({
    queryKey: contractantTendersKeys.evaluationPhaseDetail(aoId, phase),
    queryFn: () => getServiceContractantTenderEvaluationPhaseDetail(aoId, phase),
    enabled: Boolean(aoId) && Boolean(phase),
  });
}

export function useValidateEvaluationPhaseMutation(aoId: string) {
  const queryClient = useQueryClient();

  return useMutation<ServiceContractantTenderEvaluationPhaseDetail, Error, TenderEvaluationPhase>({
    mutationFn: (phase) => validateServiceContractantTenderEvaluationPhase(aoId, phase),
    onSuccess: async (_data, phase) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: contractantTendersKeys.evaluationPhases(aoId) }),
        queryClient.invalidateQueries({ queryKey: contractantTendersKeys.evaluationPhaseDetail(aoId, phase) }),
      ]);
    },
  });
}

// ─── Attribution ─────────────────────────────────────────────────────────────

export function useContractantTenderAttributionOverviewQuery(aoId: string) {
  return useQuery<ServiceContractantTenderAttributionOverview, Error>({
    queryKey: contractantTendersKeys.attributionOverview(aoId),
    queryFn: () => getServiceContractantTenderAttributionOverview(aoId),
    enabled: Boolean(aoId),
  });
}

export function usePronounceProvisionalAttributionMutation(aoId: string) {
  const queryClient = useQueryClient();

  return useMutation<ServiceContractantTenderAttributionOverview, Error, PronounceProvisionalAttributionPayload>({
    mutationFn: (payload) => pronounceServiceContractantProvisionalAttribution(aoId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: contractantTendersKeys.attributionOverview(aoId) });
    },
  });
}

export function useConfirmDefinitiveAttributionMutation(aoId: string) {
  const queryClient = useQueryClient();

  return useMutation<ServiceContractantTenderAttributionOverview, Error, ConfirmDefinitiveAttributionPayload>({
    mutationFn: (payload) => confirmServiceContractantDefinitiveAttribution(aoId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: contractantTendersKeys.attributionOverview(aoId) });
    },
  });
}

// ─── Recours ─────────────────────────────────────────────────────────────────

export function useContractantTenderRecoursQuery(aoId: string) {
  return useQuery<ServiceContractantTenderRecoursListItem[], Error>({
    queryKey: contractantTendersKeys.recours(aoId),
    queryFn: () => listServiceContractantTenderRecours(aoId),
    enabled: Boolean(aoId),
  });
}

export function useContractantTenderRecoursDetailQuery(aoId: string, recoursId: string) {
  return useQuery<ServiceContractantTenderRecoursDetail | null, Error>({
    queryKey: contractantTendersKeys.recoursDetail(aoId, recoursId),
    queryFn: () => getServiceContractantTenderRecoursById(aoId, recoursId),
    enabled: Boolean(aoId) && Boolean(recoursId),
  });
}

// ─── Avis ────────────────────────────────────────────────────────────────────

export function useContractantTenderAvisQuery(aoId: string) {
  return useQuery<TenderAvisItem[], Error>({
    queryKey: contractantTendersKeys.avis(aoId),
    queryFn: () => listServiceContractantTenderAvis(aoId),
    enabled: Boolean(aoId),
  });
}

export function useContractantTenderAvisDetailQuery(aoId: string, avisId: string) {
  return useQuery<TenderAvisItem | null, Error>({
    queryKey: contractantTendersKeys.avisDetail(aoId, avisId),
    queryFn: () => getServiceContractantTenderAvisById(aoId, avisId),
    enabled: Boolean(aoId) && Boolean(avisId),
  });
}

export function useSaveTenderAvisDraftMutation(aoId: string) {
  const queryClient = useQueryClient();

  return useMutation<TenderAvisItem, Error, SaveTenderAvisPayload>({
    mutationFn: (payload) => saveServiceContractantTenderAvisDraft(aoId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: contractantTendersKeys.avis(aoId) });
    },
  });
}

export function usePublishTenderAvisMutation(aoId: string) {
  const queryClient = useQueryClient();

  return useMutation<TenderAvisItem, Error, SaveTenderAvisPayload>({
    mutationFn: (payload) => publishServiceContractantTenderAvis(aoId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: contractantTendersKeys.avis(aoId) });
    },
  });
}

export function usePublishTenderAvisByIdMutation(aoId: string) {
  const queryClient = useQueryClient();

  return useMutation<TenderAvisItem, Error, string>({
    mutationFn: (avisId) => publishServiceContractantTenderAvisById(aoId, avisId),
    onSuccess: async (_data, avisId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: contractantTendersKeys.avis(aoId) }),
        queryClient.invalidateQueries({ queryKey: contractantTendersKeys.avisDetail(aoId, avisId) }),
      ]);
    },
  });
}

interface UpdateTenderAvisVariables {
  avisId: string;
  payload: SaveTenderAvisPayload;
  publish?: boolean;
}

export function useUpdateTenderAvisMutation(aoId: string) {
  const queryClient = useQueryClient();

  return useMutation<TenderAvisItem, Error, UpdateTenderAvisVariables>({
    mutationFn: ({ avisId, payload, publish }) =>
      updateServiceContractantTenderAvis(aoId, avisId, payload, publish),
    onSuccess: async (_data, { avisId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: contractantTendersKeys.avis(aoId) }),
        queryClient.invalidateQueries({ queryKey: contractantTendersKeys.avisDetail(aoId, avisId) }),
      ]);
    },
  });
}

export function useDeleteTenderAvisMutation(aoId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (avisId) => deleteServiceContractantTenderAvis(aoId, avisId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: contractantTendersKeys.avis(aoId) });
    },
  });
}

// ─── AI Orchestrator ─────────────────────────────────────────────────────────

import { generateCdcDraft, type GenerateCdcDraftPayload, type GenerateCdcDraftResponse } from "./api";

export function useGenerateCdcDraftMutation() {
  return useMutation<GenerateCdcDraftResponse, Error, GenerateCdcDraftPayload>({
    mutationFn: (payload) => generateCdcDraft(payload),
  });
}
