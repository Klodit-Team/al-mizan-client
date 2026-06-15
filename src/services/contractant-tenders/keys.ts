export const contractantTendersKeys = {
  all: ["contractant-tenders"] as const,

  // Soumissions
  submissions: (aoId: string) => [...contractantTendersKeys.all, "submissions", aoId] as const,
  submissionDetail: (aoId: string, submissionId: string) =>
    [...contractantTendersKeys.all, "submissions", aoId, submissionId] as const,

  // Evaluation
  evaluationPhases: (aoId: string) => [...contractantTendersKeys.all, "evaluation-phases", aoId] as const,
  evaluationPhaseDetail: (aoId: string, phase: string) =>
    [...contractantTendersKeys.all, "evaluation-phase", aoId, phase] as const,

  // Attribution
  attributionOverview: (aoId: string) => [...contractantTendersKeys.all, "attribution", aoId] as const,

  // Recours
  recours: (aoId: string) => [...contractantTendersKeys.all, "recours", aoId] as const,
  recoursDetail: (aoId: string, recoursId: string) =>
    [...contractantTendersKeys.all, "recours", aoId, recoursId] as const,

  // Avis
  avis: (aoId: string) => [...contractantTendersKeys.all, "avis", aoId] as const,
  avisDetail: (aoId: string, avisId: string) =>
    [...contractantTendersKeys.all, "avis", aoId, avisId] as const,
};
