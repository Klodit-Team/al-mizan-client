// ─── Recours Types ────────────────────────────────────────────────────────────

export type RecoursStatus = "depose" | "en_examen" | "accepte" | "rejete";

export interface RecoursItem {
  id: string;
  reference: string;
  aoReference: string;
  aoObject: string;
  dateDepot: string;
  dateLimiteReponse: string;
  dateDecision?: string;
  statut: RecoursStatus;
  motif: string;
  piecesJointes: PieceJointe[];
  decision?: {
    statut: "accepte" | "rejete";
    motif: string;
    date: string;
  };
  // Context about the tender
  attribution: {
    winner: string;
    montantAttribue: string;
    dateAttribution: string;
  };
}

export interface PieceJointe {
  id: string;
  nom: string;
  taille: string;
  type: string;
}

// ─── Mock data ─────────────────────────────────────────────────────────────────

export const MOCK_RECOURS: RecoursItem[] = [
  {
    id: "REC-001",
    reference: "REC-2024-001",
    aoReference: "AO-2024-003",
    aoObject: "Acquisition de matériel médical spécialisé",
    dateDepot: "2024-11-05",
    dateLimiteReponse: "2024-11-20",
    dateDecision: "2024-11-18",
    statut: "accepte",
    motif:
      "Notre offre technique a été sous-évaluée sur le critère d'expérience. Nous disposons de 15 ans d'expérience dans le domaine médical, largement supérieure au minimum requis. Les références fournies n'ont pas été prises en compte lors de l'évaluation.",
    piecesJointes: [
      { id: "pj1", nom: "References_techniques.pdf", taille: "2.4 MB", type: "pdf" },
      { id: "pj2", nom: "Certificats_experience.pdf", taille: "1.1 MB", type: "pdf" },
    ],
    attribution: {
      winner: "MediTech Algérie SARL",
      montantAttribue: "62 500 000 DZD",
      dateAttribution: "2024-10-28",
    },
    decision: {
      statut: "accepte",
      motif:
        "Après examen, la commission reconnaît que les références techniques du soumissionnaire n'ont pas été correctement évaluées. Le recours est accepté et l'évaluation sera reconsidérée.",
      date: "2024-11-18",
    },
  },
  {
    id: "REC-002",
    reference: "REC-2024-002",
    aoReference: "AO-2024-001",
    aoObject: "Fourniture et installation d'équipements informatiques",
    dateDepot: "2024-11-10",
    dateLimiteReponse: "2024-11-25",
    statut: "en_examen",
    motif:
      "L'offre financière du soumissionnaire retenu présente des anomalies manifestes. Le montant proposé est anormalement bas et ne reflète pas la réalité du marché. Nous demandons une révision de la procédure d'attribution.",
    piecesJointes: [
      { id: "pj3", nom: "Analyse_prix_marche.pdf", taille: "3.2 MB", type: "pdf" },
      { id: "pj4", nom: "Rapport_comparatif.xlsx", taille: "0.8 MB", type: "xlsx" },
    ],
    attribution: {
      winner: "InfoSys Pro EURL",
      montantAttribue: "38 200 000 DZD",
      dateAttribution: "2024-11-01",
    },
  },
  {
    id: "REC-003",
    reference: "REC-2024-003",
    aoReference: "AO-2024-007",
    aoObject: "Développement et déploiement d'une application métier",
    dateDepot: "2024-10-15",
    dateLimiteReponse: "2024-10-30",
    dateDecision: "2024-10-29",
    statut: "rejete",
    motif:
      "Le critère d'évaluation relatif aux délais de livraison a été appliqué de manière discriminatoire. Notre calendrier de 6 mois est réaliste et conforme aux exigences du CDC.",
    piecesJointes: [
      { id: "pj5", nom: "Planning_detaille.pdf", taille: "1.8 MB", type: "pdf" },
    ],
    attribution: {
      winner: "AlgoDev Technologies",
      montantAttribue: "21 500 000 DZD",
      dateAttribution: "2024-10-05",
    },
    decision: {
      statut: "rejete",
      motif:
        "Après examen des éléments fournis, la commission estime que les critères d'évaluation ont été appliqués de manière uniforme et conforme au règlement. Le recours est rejeté.",
      date: "2024-10-29",
    },
  },
  {
    id: "REC-004",
    reference: "REC-2024-004",
    aoReference: "AO-2024-012",
    aoObject: "Travaux de rénovation du siège administratif",
    dateDepot: "2024-12-01",
    dateLimiteReponse: "2024-12-16",
    statut: "depose",
    motif:
      "Contestation de la note technique obtenue sur le critère méthodologie. Notre approche innovante n'a pas été correctement appréciée par la commission d'évaluation.",
    piecesJointes: [
      { id: "pj6", nom: "Memoire_technique.pdf", taille: "5.1 MB", type: "pdf" },
      { id: "pj7", nom: "Plans_architecture.pdf", taille: "8.3 MB", type: "pdf" },
    ],
    attribution: {
      winner: "BatiConstruct SARL",
      montantAttribue: "145 000 000 DZD",
      dateAttribution: "2024-11-22",
    },
  },
];

// ─── Status helpers ────────────────────────────────────────────────────────────

export const STATUS_META: Record<
  RecoursStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  depose:     { label: "Déposé",     bg: "bg-slate-100",   text: "text-slate-600",   border: "border-slate-200" },
  en_examen:  { label: "En examen",  bg: "bg-orange-100",  text: "text-orange-700",  border: "border-orange-200" },
  accepte:    { label: "Accepté",    bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  rejete:     { label: "Rejeté",     bg: "bg-rose-100",    text: "text-rose-700",    border: "border-rose-200" },
};

export function fmt(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-DZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function isDeadlineUrgent(dateLimite: string): boolean {
  const diff = new Date(dateLimite).getTime() - Date.now();
  return diff < 3 * 24 * 60 * 60 * 1000; // less than 3 days
}

export function isDeadlinePast(dateLimite: string): boolean {
  return new Date(dateLimite).getTime() < Date.now();
}