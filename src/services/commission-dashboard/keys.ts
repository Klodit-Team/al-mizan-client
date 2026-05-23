// ─────────────────────────────────────────────────────────────────────────────
// AL-Mizan — Commission Dashboard Query Keys
// ─────────────────────────────────────────────────────────────────────────────

export const commissionDashboardKeys = {
  // Namespace racine
  all: ["commission-dashboard"] as const,

  // ── Commissions d'évaluation ───────────────────────────────────────────────
  evaluation: {
    all: () => [...commissionDashboardKeys.all, "evaluation"] as const,
    lists: () =>
      [...commissionDashboardKeys.evaluation.all(), "list"] as const,
    list: (params?: Record<string, unknown>) =>
      [...commissionDashboardKeys.evaluation.lists(), params ?? {}] as const,
    details: () =>
      [...commissionDashboardKeys.evaluation.all(), "detail"] as const,
    detail: (id: string) =>
      [...commissionDashboardKeys.evaluation.details(), id] as const,
    membres: (commissionId: string) =>
      [
        ...commissionDashboardKeys.evaluation.detail(commissionId),
        "membres",
      ] as const,
  },

  // ── Commissions de marché ──────────────────────────────────────────────────
  marche: {
    all: () => [...commissionDashboardKeys.all, "marche"] as const,
    lists: () => [...commissionDashboardKeys.marche.all(), "list"] as const,
    list: (params?: Record<string, unknown>) =>
      [...commissionDashboardKeys.marche.lists(), params ?? {}] as const,
    details: () =>
      [...commissionDashboardKeys.marche.all(), "detail"] as const,
    detail: (id: string) =>
      [...commissionDashboardKeys.marche.details(), id] as const,
    membres: (commissionId: string) =>
      [
        ...commissionDashboardKeys.marche.detail(commissionId),
        "membres",
      ] as const,
    deliberation: (commissionId: string) =>
      [
        ...commissionDashboardKeys.marche.detail(commissionId),
        "deliberation",
      ] as const,
  },

  // ── Séances d'ouverture ────────────────────────────────────────────────────
  seance: {
    all: () => [...commissionDashboardKeys.all, "seance"] as const,
    lists: () => [...commissionDashboardKeys.seance.all(), "list"] as const,
    list: (commissionId?: string) =>
      [...commissionDashboardKeys.seance.lists(), commissionId ?? "all"] as const,
    details: () =>
      [...commissionDashboardKeys.seance.all(), "detail"] as const,
    detail: (id: string) =>
      [...commissionDashboardKeys.seance.details(), id] as const,
    resultats: (seanceId: string) =>
      [
        ...commissionDashboardKeys.seance.detail(seanceId),
        "resultats",
      ] as const,
  },

  // ── Agrégation "mes commissions" ───────────────────────────────────────────
  mesCommissions: () =>
    [...commissionDashboardKeys.all, "mes-commissions"] as const,
};