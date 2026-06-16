import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { commissionDashboardKeys } from "./keys";
import {
  // Aggregation
  getMesCommissionsData,
  type MesCommissionsData,
  // Commission évaluation
  listCommissionsEvaluation,
  getCommissionEvaluation,
  createCommissionEvaluation,
  updateCommissionEvaluation,
  deleteCommissionEvaluation,
  changeStatutEvaluation,
  listMembresEvaluation,
  addMembreEvaluation,
  updateMembreEvaluation,
  removeMembreEvaluation,
  // Commission marché
  listCommissionsMarche,
  getCommissionMarche,
  createCommissionMarche,
  updateCommissionMarche,
  deleteCommissionMarche,
  changeStatutMarche,
  setDeliberation,
  getDeliberation,
  attribuerMarche,
  listMembresMarche,
  addMembreMarche,
  updateMembreMarche,
  removeMembreMarche,
  // Séances d'ouverture
  listSeancesOuverture,
  getSeanceOuverture,
  createSeanceOuverture,
  updateSeanceOuverture,
  deleteSeanceOuverture,
  demarrerSeance,
  terminerSeance,
  generatePV,
  listResultats,
  addResultat,
  updateResultat,
  deleteResultat,
  // Types
  type PaginationQuery,
  type CommissionEvaluation,
  type CommissionMarche,
  type SeanceOuverture,
  type MembreEvaluation,
  type MembreMarche,
  type ResultatOuverture,
  type CreateCommissionEvaluationDto,
  type UpdateCommissionEvaluationDto,
  type ChangeStatutEvaluationDto,
  type AddMembreEvaluationDto,
  type UpdateMembreEvaluationDto,
  type CreateCommissionMarcheDto,
  type UpdateCommissionMarcheDto,
  type ChangeStatutMarcheDto,
  type DeliberationDto,
  type AttributionDto,
  type AddMembreMarcheDto,
  type UpdateMembreMarcheDto,
  type CreateSeanceDto,
  type UpdateSeanceDto,
  type CreateResultatDto,
  type UpdateResultatDto,
} from "./api";

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard aggregation
// ─────────────────────────────────────────────────────────────────────────────

export function useMesCommissionsQuery(userId?: string): UseQueryResult<MesCommissionsData, Error> {
  return useQuery<MesCommissionsData, Error>({
    queryKey: commissionDashboardKeys.mesCommissions(userId),
    queryFn: () => getMesCommissionsData(userId),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Commissions d'évaluation — Queries
// ─────────────────────────────────────────────────────────────────────────────

export function useCommissionsEvaluationQuery(params: PaginationQuery = {}) {
  return useQuery({
    queryKey: commissionDashboardKeys.evaluation.list(
      params as Record<string, unknown>
    ),
    queryFn: () => listCommissionsEvaluation(params),
  });
}

export function useCommissionEvaluationQuery(id: string) {
  return useQuery<CommissionEvaluation, Error>({
    queryKey: commissionDashboardKeys.evaluation.detail(id),
    queryFn: () => getCommissionEvaluation(id),
    enabled: Boolean(id),
  });
}

export function useMembresEvaluationQuery(commissionId: string) {
  return useQuery<MembreEvaluation[], Error>({
    queryKey: commissionDashboardKeys.evaluation.membres(commissionId),
    queryFn: () => listMembresEvaluation(commissionId),
    enabled: Boolean(commissionId),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Commissions d'évaluation — Mutations
// ─────────────────────────────────────────────────────────────────────────────

export function useCreateCommissionEvaluationMutation() {
  const queryClient = useQueryClient();
  return useMutation<CommissionEvaluation, Error, CreateCommissionEvaluationDto>({
    mutationFn: createCommissionEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.evaluation.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.mesCommissions(),
      });
    },
  });
}

export function useUpdateCommissionEvaluationMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation<
    CommissionEvaluation,
    Error,
    UpdateCommissionEvaluationDto
  >({
    mutationFn: (dto) => updateCommissionEvaluation(id, dto),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        commissionDashboardKeys.evaluation.detail(id),
        updated
      );
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.evaluation.lists(),
      });
    },
  });
}

export function useDeleteCommissionEvaluationMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteCommissionEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.evaluation.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.mesCommissions(),
      });
    },
  });
}

export function useChangeStatutEvaluationMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation<CommissionEvaluation, Error, ChangeStatutEvaluationDto>({
    mutationFn: (dto) => changeStatutEvaluation(id, dto),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        commissionDashboardKeys.evaluation.detail(id),
        updated
      );
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.evaluation.lists(),
      });
    },
  });
}

export function useAddMembreEvaluationMutation(commissionId: string) {
  const queryClient = useQueryClient();
  return useMutation<MembreEvaluation, Error, AddMembreEvaluationDto>({
    mutationFn: (dto) => addMembreEvaluation(commissionId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.evaluation.membres(commissionId),
      });
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.evaluation.detail(commissionId),
      });
    },
  });
}

export function useUpdateMembreEvaluationMutation(
  commissionId: string,
  membreId: string
) {
  const queryClient = useQueryClient();
  return useMutation<MembreEvaluation, Error, UpdateMembreEvaluationDto>({
    mutationFn: (dto) => updateMembreEvaluation(commissionId, membreId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.evaluation.membres(commissionId),
      });
    },
  });
}

export function useRemoveMembreEvaluationMutation(commissionId: string) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (membreId) => removeMembreEvaluation(commissionId, membreId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.evaluation.membres(commissionId),
      });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Commissions de marché — Queries
// ─────────────────────────────────────────────────────────────────────────────

export function useCommissionsMarcheQuery(params: PaginationQuery = {}) {
  return useQuery({
    queryKey: commissionDashboardKeys.marche.list(
      params as Record<string, unknown>
    ),
    queryFn: () => listCommissionsMarche(params),
  });
}

export function useCommissionMarcheQuery(id: string) {
  return useQuery<CommissionMarche, Error>({
    queryKey: commissionDashboardKeys.marche.detail(id),
    queryFn: () => getCommissionMarche(id),
    enabled: Boolean(id),
  });
}

export function useMembersMarcheQuery(commissionId: string) {
  return useQuery<MembreMarche[], Error>({
    queryKey: commissionDashboardKeys.marche.membres(commissionId),
    queryFn: () => listMembresMarche(commissionId),
    enabled: Boolean(commissionId),
  });
}

export function useDeliberationQuery(commissionId: string) {
  return useQuery<{ pvDeliberation: string; observations?: string }, Error>({
    queryKey: commissionDashboardKeys.marche.deliberation(commissionId),
    queryFn: () => getDeliberation(commissionId),
    enabled: Boolean(commissionId),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Commissions de marché — Mutations
// ─────────────────────────────────────────────────────────────────────────────

export function useCreateCommissionMarcheMutation() {
  const queryClient = useQueryClient();
  return useMutation<CommissionMarche, Error, CreateCommissionMarcheDto>({
    mutationFn: createCommissionMarche,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.marche.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.mesCommissions(),
      });
    },
  });
}

export function useUpdateCommissionMarcheMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation<CommissionMarche, Error, UpdateCommissionMarcheDto>({
    mutationFn: (dto) => updateCommissionMarche(id, dto),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        commissionDashboardKeys.marche.detail(id),
        updated
      );
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.marche.lists(),
      });
    },
  });
}

export function useDeleteCommissionMarcheMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteCommissionMarche,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.marche.lists(),
      });
    },
  });
}

export function useChangeStatutMarcheMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation<CommissionMarche, Error, ChangeStatutMarcheDto>({
    mutationFn: (dto) => changeStatutMarche(id, dto),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        commissionDashboardKeys.marche.detail(id),
        updated
      );
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.marche.lists(),
      });
    },
  });
}

export function useSetDeliberationMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation<CommissionMarche, Error, DeliberationDto>({
    mutationFn: (dto) => setDeliberation(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.marche.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.marche.deliberation(id),
      });
    },
  });
}

export function useAttribuerMarcheMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation<CommissionMarche, Error, AttributionDto>({
    mutationFn: (dto) => attribuerMarche(id, dto),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        commissionDashboardKeys.marche.detail(id),
        updated
      );
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.marche.lists(),
      });
    },
  });
}

export function useAddMembreMarcheMutation(commissionId: string) {
  const queryClient = useQueryClient();
  return useMutation<MembreMarche, Error, AddMembreMarcheDto>({
    mutationFn: (dto) => addMembreMarche(commissionId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.marche.membres(commissionId),
      });
    },
  });
}

export function useUpdateMembreMarcheMutation(
  commissionId: string,
  membreId: string
) {
  const queryClient = useQueryClient();
  return useMutation<MembreMarche, Error, UpdateMembreMarcheDto>({
    mutationFn: (dto) => updateMembreMarche(commissionId, membreId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.marche.membres(commissionId),
      });
    },
  });
}

export function useRemoveMembreMarcheMutation(commissionId: string) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (membreId) => removeMembreMarche(commissionId, membreId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.marche.membres(commissionId),
      });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Séances d'ouverture — Queries
// ─────────────────────────────────────────────────────────────────────────────

export function useSeancesOuvertureQuery(commissionId?: string) {
  return useQuery<SeanceOuverture[], Error>({
    queryKey: commissionDashboardKeys.seance.list(commissionId),
    queryFn: () => listSeancesOuverture(commissionId),
  });
}

export function useSeanceOuvertureQuery(id: string) {
  return useQuery<SeanceOuverture, Error>({
    queryKey: commissionDashboardKeys.seance.detail(id),
    queryFn: () => getSeanceOuverture(id),
    enabled: Boolean(id),
  });
}

export function useResultatsOuvertureQuery(seanceId: string) {
  return useQuery<ResultatOuverture[], Error>({
    queryKey: commissionDashboardKeys.seance.resultats(seanceId),
    queryFn: () => listResultats(seanceId),
    enabled: Boolean(seanceId),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Séances d'ouverture — Mutations
// ─────────────────────────────────────────────────────────────────────────────

export function useCreateSeanceMutation() {
  const queryClient = useQueryClient();
  return useMutation<SeanceOuverture, Error, CreateSeanceDto>({
    mutationFn: createSeanceOuverture,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.seance.lists(),
      });
    },
  });
}

export function useUpdateSeanceMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation<SeanceOuverture, Error, UpdateSeanceDto>({
    mutationFn: (dto) => updateSeanceOuverture(id, dto),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        commissionDashboardKeys.seance.detail(id),
        updated
      );
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.seance.lists(),
      });
    },
  });
}

export function useDeleteSeanceMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteSeanceOuverture,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.seance.lists(),
      });
    },
  });
}

export function useDemarrerSeanceMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation<SeanceOuverture, Error, void>({
    mutationFn: () => demarrerSeance(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        commissionDashboardKeys.seance.detail(id),
        updated
      );
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.seance.lists(),
      });
    },
  });
}

export function useTerminerSeanceMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation<SeanceOuverture, Error, void>({
    mutationFn: () => terminerSeance(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        commissionDashboardKeys.seance.detail(id),
        updated
      );
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.seance.lists(),
      });
    },
  });
}

export function useGeneratePVMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation<{ url: string }, Error, void>({
    mutationFn: () => generatePV(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.seance.detail(id),
      });
    },
  });
}

export function useAddResultatMutation(seanceId: string) {
  const queryClient = useQueryClient();
  return useMutation<ResultatOuverture, Error, CreateResultatDto>({
    mutationFn: (dto) => addResultat(seanceId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.seance.resultats(seanceId),
      });
    },
  });
}

export function useUpdateResultatMutation(
  seanceId: string,
  resultatId: string
) {
  const queryClient = useQueryClient();
  return useMutation<ResultatOuverture, Error, UpdateResultatDto>({
    mutationFn: (dto) => updateResultat(seanceId, resultatId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.seance.resultats(seanceId),
      });
    },
  });
}

export function useDeleteResultatMutation(seanceId: string) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (resultatId) => deleteResultat(seanceId, resultatId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commissionDashboardKeys.seance.resultats(seanceId),
      });
    },
  });
}