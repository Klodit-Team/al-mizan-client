// ─── Shared types for the soumission wizard ───────────────────────────────────

export type OeAoType   = "ouvert" | "restreint" | "gre_a_gre";
export type OeAoStatus =
  | "publie"
  | "en_cours"
  | "evaluation"
  | "attribue"
  | "annule"
  | "cloture";
export type DocStatus  = "conforme" | "expire" | "manquant" | "uploade";
export type SubStatus  =
  | "brouillon" | "deposee" | "recue" | "evaluee" | "retenue" | "rejetee";

export interface AoLot {
  id: string;
  lotNumber: string;
  designation: string;
  estimatedAmount?: string;
}

export interface AoOption {
  id: string;
  reference: string;
  object: string;
  type: OeAoType;
  status: OeAoStatus;
  organizationName: string;
  wilaya: string;
  deadline: string;
  lots: AoLot[];
}

export interface AdminDoc {
  id: string;
  label: string;
  required: boolean;
  status: DocStatus;
  fileName?: string;
  expiry?: string;
}

export interface BpuLine {
  id: string;
  designation: string;
  unite: string;
  quantite: string;
  prixUnitaire: string;
}

export interface LotBpu {
  lotId: string;
  lines: BpuLine[];
}

export interface CautionData {
  reference: string;
  banque: string;
  montant: string;
  emission: string;
  expiry: string;
  file: File | null;
}

/** Full wizard state passed between steps */
export interface WizardState {
  selectedAoId: string;
  selectedLotId: string;
  docs: AdminDoc[];
  offreTechFile: File | null;
  lotBpus: LotBpu[];
  caution: CautionData;
}

// ─── Mock AOs ─────────────────────────────────────────────────────────────────

export const AO_OPTIONS: AoOption[] = [
  {
    id: "AO-2024-002", reference: "AO-2024-002",
    object: "Travaux de réhabilitation du réseau routier urbain",
    type: "ouvert", status: "publie",
    organizationName: "Direction des Travaux Publics - Oran",
    wilaya: "Oran", deadline: "2024-11-22",
    lots: [
      { id: "l3", lotNumber: "1", designation: "Terrassement et génie civil", estimatedAmount: "180 000 000 DZD" },
      { id: "l4", lotNumber: "2", designation: "Signalisation et éclairage", estimatedAmount: "140 000 000 DZD" },
    ],
  },
  {
    id: "AO-2024-004", reference: "AO-2024-004",
    object: "Prestation de services de sécurité et gardiennage",
    type: "ouvert", status: "publie",
    organizationName: "Université de Constantine",
    wilaya: "Constantine", deadline: "2024-12-05",
    lots: [
      { id: "l7", lotNumber: "1", designation: "Gardiennage campus principal", estimatedAmount: "8 000 000 DZD" },
      { id: "l8", lotNumber: "2", designation: "Gardiennage résidences", estimatedAmount: "4 000 000 DZD" },
    ],
  },
  {
    id: "AO-2024-005", reference: "AO-2024-005",
    object: "Construction d'une école primaire",
    type: "ouvert", status: "publie",
    organizationName: "Direction de l'Éducation - Sidi Bel Abbès",
    wilaya: "Sidi Bel Abbès", deadline: "2024-12-18",
    lots: [
      { id: "l9",  lotNumber: "1", designation: "Gros oeuvre et maçonnerie", estimatedAmount: "90 000 000 DZD" },
      { id: "l10", lotNumber: "2", designation: "Second oeuvre et finitions", estimatedAmount: "60 000 000 DZD" },
    ],
  },
  {
    id: "AO-2024-008", reference: "AO-2024-008",
    object: "Entretien et maintenance des espaces verts municipaux",
    type: "ouvert", status: "publie",
    organizationName: "Commune de Tlemcen",
    wilaya: "Tlemcen", deadline: "2024-12-10",
    lots: [
      { id: "l15", lotNumber: "1", designation: "Entretien parcs et jardins", estimatedAmount: "4 000 000 DZD" },
    ],
  },
];

export const INITIAL_DOCS: AdminDoc[] = [
  { id: "rc",     label: "Registre de commerce",            required: true,  status: "conforme", fileName: "RC_BENALI_2024.pdf",   expiry: "2025-06-30" },
  { id: "nif",    label: "Carte NIF",                       required: true,  status: "conforme", fileName: "NIF_BENALI.pdf" },
  { id: "nis",    label: "Attestation NIS",                 required: true,  status: "conforme", fileName: "NIS_BENALI.pdf" },
  { id: "cnas",   label: "Attestation CNAS",                required: true,  status: "expire",   fileName: "CNAS_2023.pdf",        expiry: "2024-09-15" },
  { id: "casnos", label: "Attestation CASNOS",              required: true,  status: "manquant" },
  { id: "fiscal", label: "Attestation fiscale",             required: true,  status: "conforme", fileName: "FISCAL_2024.pdf",      expiry: "2024-12-31" },
  { id: "casier", label: "Casier judiciaire du gérant", required: true,  status: "manquant" },
  { id: "bilan",  label: "Bilan des 3 dernières années", required: false, status: "conforme", fileName: "BILAN_2021_2023.pdf" },
];

export const INITIAL_CAUTION: CautionData = {
  reference: "", banque: "", montant: "", emission: "", expiry: "", file: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function fmtDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-DZ", { day: "numeric", month: "short", year: "numeric" });
}

export function buildDefaultBpus(lotIds: string[], allLots: AoLot[]): LotBpu[] {
  return lotIds.map((lotId) => ({
    lotId,
    lines: [
      { id: `${lotId}-l1`, designation: allLots.find((l) => l.id === lotId)?.designation ?? "Prestation", unite: "Forf.", quantite: "1", prixUnitaire: "" },
    ],
  }));
}

export const TYPE_LABELS: Record<OeAoType, string> = {
  ouvert: "AO ouvert",
  restreint: "AO restreint",
  gre_a_gre: "Gré à gré",
};