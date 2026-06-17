export const commissionKeys = {
  all: ["commission"] as const,
  evaluationsOverview: () => [...commissionKeys.all, "evaluations-overview"] as const,
  evaluationContext: (commissionId: string, aoId: string) =>
    [...commissionKeys.all, "evaluation-context", commissionId, aoId] as const,
  evaluationDetail: (aoId: string) => [...commissionKeys.all, "evaluation", aoId] as const,
  evaluationSubmissions: (aoId: string) => [...commissionKeys.all, "evaluation-submissions", aoId] as const,
  aoSubmissions: (aoId: string) => [...commissionKeys.all, "ao-submissions", aoId] as const,
  evaluationCriteria: (aoId: string) => [...commissionKeys.all, "evaluation-criteria", aoId] as const,
  aoCriteria: (aoId: string) => [...commissionKeys.all, "ao-criteria", aoId] as const,
  evaluationNotes: (evaluationId: string, submissionId: string) =>
    [...commissionKeys.all, "evaluation-notes", evaluationId, submissionId] as const,
  aoAnomalies: (aoId: string) => [...commissionKeys.all, "ao-anomalies", aoId] as const,
  documents: (soumissionId: string) => [...commissionKeys.all, "documents", soumissionId] as const,
  classement: (aoId: string) => [...commissionKeys.all, "classement", aoId] as const,
  preDechiffrement: (offreId: string) => [...commissionKeys.all, "pre-dechiffrement", offreId] as const,
  dechiffrement: (offreId: string) => [...commissionKeys.all, "dechiffrement", offreId] as const,
};
