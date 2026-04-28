
export type OeAoStatus =
  | "publie"
  | "en_cours"
  | "evaluation"
  | "attribue"
  | "annule"
  | "cloture";

export type OeAoType = "ouvert" | "restreint" | "gre_a_gre";

export type OeSubmissionStatus =
  | "brouillon"
  | "deposee"
  | "recue"
  | "evaluee"
  | "retenue"
  | "rejetee";

export type OeRecoursStatus = "depose" | "en_examen" | "accepte" | "rejete";

// ── AO (Appel d'Offres) seen by the operator ─────────────────────────────────

export interface OeAoItem {
  id: string;
  reference: string;
  object: string;
  type: OeAoType;
  /** ISO date string */
  deadline: string;
  status: OeAoStatus;
  organizationName: string;
  wilaya: string;
  sector: string;
  estimatedAmount?: string;
  /** Whether the operator has already submitted an offer */
  hasSubmission: boolean;
  submissionStatus?: OeSubmissionStatus;
  lots: OeAoLot[];
}

export interface OeAoLot {
  id: string;
  lotNumber: string;
  designation: string;
  estimatedAmount?: string;
}

// ── Dashboard stats ───────────────────────────────────────────────────────────

export interface OeDashboardStats {
  aoActifs: number;
  soumissionsEnCours: number;
  marchesRemportes: number;
  recoursOuverts: number;
}

// ── Activity feed ─────────────────────────────────────────────────────────────

export interface OeActivityItem {
  id: string;
  type: "SOUMISSION" | "NOTIFICATION" | "RECOURS" | "RESULTAT";
  title: string;
  subtitle: string;
  timestamp: string;
}

// ── Upcoming deadlines ────────────────────────────────────────────────────────

export interface OeDeadlineItem {
  id: string;
  title: string;
  dueAt: string;
  urgency: "high" | "medium" | "low";
}

// ── My submissions ────────────────────────────────────────────────────────────

export interface OeSubmissionItem {
  id: string;
  aoReference: string;
  aoObject: string;
  submittedAt: string;
  status: OeSubmissionStatus;
}

// ── My recours ────────────────────────────────────────────────────────────────

export interface OeRecoursItem {
  id: string;
  aoReference: string;
  aoObject: string;
  depositedAt: string;
  status: OeRecoursStatus;
  motif: string;
}

// ── Full dashboard payload ────────────────────────────────────────────────────

export interface OeDashboardData {
  userName: string;
  companyName: string;
  stats: OeDashboardStats;
  activities: OeActivityItem[];
  deadlines: OeDeadlineItem[];
  recentSubmissions: OeSubmissionItem[];
  openRecours: OeRecoursItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock data helpers
// ─────────────────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MOCK_AOS: OeAoItem[] = [
  {
    id: "AO-2024-001",
    reference: "AO-2024-001",
    object: "Fourniture et installation d'équipements informatiques",
    type: "ouvert",
    deadline: "2024-11-15",
    status: "en_cours",
    organizationName: "Direction des Systèmes d'Information - Alger",
    wilaya: "Alger",
    sector: "Informatique",
    estimatedAmount: "45 000 000 DZD",
    hasSubmission: true,
    submissionStatus: "deposee",
    lots: [
      { id: "lot-1", lotNumber: "1", designation: "Serveurs et équipements réseaux", estimatedAmount: "25 000 000 DZD" },
      { id: "lot-2", lotNumber: "2", designation: "Postes de travail et périphériques", estimatedAmount: "20 000 000 DZD" },
    ],
  },
  {
    id: "AO-2024-002",
    reference: "AO-2024-002",
    object: "Travaux de réhabilitation du réseau routier urbain",
    type: "ouvert",
    deadline: "2024-11-22",
    status: "publie",
    organizationName: "Direction des Travaux Publics - Oran",
    wilaya: "Oran",
    sector: "BTP",
    estimatedAmount: "320 000 000 DZD",
    hasSubmission: false,
    lots: [
      { id: "lot-3", lotNumber: "1", designation: "Terrassement et génie civil", estimatedAmount: "180 000 000 DZD" },
      { id: "lot-4", lotNumber: "2", designation: "Signalisation et éclairage", estimatedAmount: "140 000 000 DZD" },
    ],
  },
  {
    id: "AO-2024-003",
    reference: "AO-2024-003",
    object: "Acquisition de matériel médical spécialisé",
    type: "restreint",
    deadline: "2024-10-30",
    status: "evaluation",
    organizationName: "CHU Mustapha Pacha - Alger",
    wilaya: "Alger",
    sector: "Santé",
    estimatedAmount: "95 000 000 DZD",
    hasSubmission: true,
    submissionStatus: "evaluee",
    lots: [
      { id: "lot-5", lotNumber: "1", designation: "Équipements de radiologie", estimatedAmount: "60 000 000 DZD" },
      { id: "lot-6", lotNumber: "2", designation: "Équipements de laboratoire", estimatedAmount: "35 000 000 DZD" },
    ],
  },
  {
    id: "AO-2024-004",
    reference: "AO-2024-004",
    object: "Prestation de services de sécurité et gardiennage",
    type: "ouvert",
    deadline: "2024-12-05",
    status: "publie",
    organizationName: "Université de Constantine",
    wilaya: "Constantine",
    sector: "Services",
    estimatedAmount: "12 000 000 DZD",
    hasSubmission: false,
    lots: [
      { id: "lot-7", lotNumber: "1", designation: "Gardiennage campus principal", estimatedAmount: "8 000 000 DZD" },
      { id: "lot-8", lotNumber: "2", designation: "Gardiennage résidences universitaires", estimatedAmount: "4 000 000 DZD" },
    ],
  },
  {
    id: "AO-2024-005",
    reference: "AO-2024-005",
    object: "Construction d'une école primaire à Sidi Bel Abbès",
    type: "ouvert",
    deadline: "2024-12-18",
    status: "publie",
    organizationName: "Direction de l'Éducation - Sidi Bel Abbès",
    wilaya: "Sidi Bel Abbès",
    sector: "Éducation",
    estimatedAmount: "150 000 000 DZD",
    hasSubmission: false,
    lots: [
      { id: "lot-9", lotNumber: "1", designation: "Gros œuvre et maçonnerie", estimatedAmount: "90 000 000 DZD" },
      { id: "lot-10", lotNumber: "2", designation: "Second œuvre et finitions", estimatedAmount: "60 000 000 DZD" },
    ],
  },
  {
    id: "AO-2024-006",
    reference: "AO-2024-006",
    object: "Fourniture de mobilier de bureau pour administrations",
    type: "ouvert",
    deadline: "2024-11-08",
    status: "attribue",
    organizationName: "Wilaya d'Annaba",
    wilaya: "Annaba",
    sector: "Mobilier",
    estimatedAmount: "8 500 000 DZD",
    hasSubmission: true,
    submissionStatus: "retenue",
    lots: [
      { id: "lot-11", lotNumber: "1", designation: "Mobilier de bureau standard", estimatedAmount: "5 000 000 DZD" },
      { id: "lot-12", lotNumber: "2", designation: "Mobilier de direction", estimatedAmount: "3 500 000 DZD" },
    ],
  },
  {
    id: "AO-2024-007",
    reference: "AO-2024-007",
    object: "Développement et déploiement d'une application métier",
    type: "restreint",
    deadline: "2024-11-28",
    status: "en_cours",
    organizationName: "Ministère des Finances - DSI",
    wilaya: "Alger",
    sector: "Informatique",
    estimatedAmount: "28 000 000 DZD",
    hasSubmission: true,
    submissionStatus: "recue",
    lots: [
      { id: "lot-13", lotNumber: "1", designation: "Développement logiciel", estimatedAmount: "20 000 000 DZD" },
      { id: "lot-14", lotNumber: "2", designation: "Formation et maintenance", estimatedAmount: "8 000 000 DZD" },
    ],
  },
  {
    id: "AO-2024-008",
    reference: "AO-2024-008",
    object: "Entretien et maintenance des espaces verts municipaux",
    type: "ouvert",
    deadline: "2024-12-10",
    status: "publie",
    organizationName: "Commune de Tlemcen",
    wilaya: "Tlemcen",
    sector: "Environnement",
    estimatedAmount: "6 200 000 DZD",
    hasSubmission: false,
    lots: [
      { id: "lot-15", lotNumber: "1", designation: "Entretien parcs et jardins", estimatedAmount: "4 000 000 DZD" },
      { id: "lot-16", lotNumber: "2", designation: "Fourniture de végétaux", estimatedAmount: "2 200 000 DZD" },
    ],
  },
  {
    id: "AO-2026-001",
    reference: "AO-2026-001",
    object: "Prestation de services de sécurité et gardiennage",
    type: "ouvert",
    deadline: "2026-12-05",
    status: "publie",
    organizationName: "Université de Constantine",
    wilaya: "Constantine",
    sector: "Services",
    estimatedAmount: "12 000 000 DZD",
    hasSubmission: false,
    lots: [
      { id: "lot-7", lotNumber: "1", designation: "Gardiennage campus principal", estimatedAmount: "8 000 000 DZD" },
      { id: "lot-8", lotNumber: "2", designation: "Gardiennage résidences universitaires", estimatedAmount: "4 000 000 DZD" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export async function getOeDashboardData(): Promise<OeDashboardData> {
  await sleep(350);
  return {
    userName: "Karim Benali",
    companyName: "BENALI CONSTRUCTION SARL",
    stats: {
      aoActifs: 24,
      soumissionsEnCours: 3,
      marchesRemportes: 7,
      recoursOuverts: 1,
    },
    activities: [
      {
        id: "act-1",
        type: "NOTIFICATION",
        title: "Nouvel AO publié : Équipements informatiques",
        subtitle: "DSI Alger – Délai de soumission : 15 nov. 2024",
        timestamp: "Il y a 15 min",
      },
      {
        id: "act-2",
        type: "SOUMISSION",
        title: "Soumission confirmée – AO #2024-001",
        subtitle: "Votre offre a été reçue et horodatée avec succès.",
        timestamp: "Il y a 2 h",
      },
      {
        id: "act-3",
        type: "RESULTAT",
        title: "Résultat d'évaluation – AO #2024-006",
        subtitle: "Vous êtes l'attributaire provisoire du lot 1.",
        timestamp: "Hier",
      },
      {
        id: "act-4",
        type: "RECOURS",
        title: "Recours enregistré – AO #2024-003",
        subtitle: "Votre recours précontractuel est en cours d'examen.",
        timestamp: "Il y a 3 jours",
      },
      {
        id: "act-5",
        type: "NOTIFICATION",
        title: "Séance d'ouverture des plis – AO #2024-007",
        subtitle: "Programmée le 28 nov. 2024 à 10h00, salle des commissions.",
        timestamp: "Il y a 4 jours",
      },
    ],
    deadlines: [
      { id: "dl-1", title: "Fin de dépôt – AO #2024-001", dueAt: "Demain, 16:00", urgency: "high" },
      { id: "dl-2", title: "Retrait CDC – AO #2024-002", dueAt: "Dans 2 jours", urgency: "medium" },
      { id: "dl-3", title: "Fin de dépôt – AO #2024-007", dueAt: "Dans 5 jours", urgency: "low" },
    ],
    recentSubmissions: [
      { id: "sub-1", aoReference: "AO-2024-001", aoObject: "Fourniture équipements informatiques", submittedAt: "2024-10-28", status: "deposee" },
      { id: "sub-2", aoReference: "AO-2024-003", aoObject: "Matériel médical spécialisé", submittedAt: "2024-10-20", status: "evaluee" },
      { id: "sub-3", aoReference: "AO-2024-006", aoObject: "Mobilier de bureau", submittedAt: "2024-10-05", status: "retenue" },
      { id: "sub-4", aoReference: "AO-2024-007", aoObject: "Application métier DSI", submittedAt: "2024-10-15", status: "recue" },
    ],
    openRecours: [
      { id: "rec-1", aoReference: "AO-2024-003", aoObject: "Matériel médical spécialisé", depositedAt: "2024-10-22", status: "en_examen", motif: "Non-conformité des critères d'éligibilité" },
    ],
  };
}

export async function listOeAos(): Promise<OeAoItem[]> {
  await sleep(300);
  return MOCK_AOS;
}

export async function getOeAoById(id: string): Promise<OeAoItem | null> {
  await sleep(250);
  return MOCK_AOS.find((ao) => ao.id === id) ?? null;
}