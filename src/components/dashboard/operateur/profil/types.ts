// ─── Profile Types ─────────────────────────────────────────────────────────────

export interface PersonalInfo {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  langue: "fr" | "ar";
}

export interface OrganisationInfo {
  denomination: string;
  nif: string;
  nis: string;
  rc: string;
  adresse: string;
  wilaya: string;
  type: "SARL" | "SPA" | "EURL" | "SNC" | "Autre";
  is_verified: boolean;
}

export interface OeProfileInfo {
  qualifications: string[];
  categoriesProfessionnelles: string[];
  is_eligible: boolean;
  is_blacklisted: boolean;
}

export interface Session {
  id: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  isCurrent: boolean;
}

// ─── Mock data ──────────────────────────────────────────────────────────────────

export const MOCK_PERSONAL: PersonalInfo = {
  prenom: "Karim",
  nom: "Benali",
  email: "k.benali@benali-construction.dz",
  telephone: "+213 555 123 456",
  langue: "fr",
};

export const MOCK_ORGANISATION: OrganisationInfo = {
  denomination: "BENALI CONSTRUCTION SARL",
  nif: "099820154321987",
  nis: "099820154321988",
  rc: "16/00-1234567B19",
  adresse: "Zone Industrielle, Lot 12, Bir Mourad Raïs",
  wilaya: "Alger",
  type: "SARL",
  is_verified: true,
};

export const MOCK_OE_PROFILE: OeProfileInfo = {
  qualifications: ["ISO 9001:2015", "CTTP Catégorie 3", "Agréé DGSN"],
  categoriesProfessionnelles: ["Bâtiment & Travaux Publics", "Génie Civil", "Réhabilitation"],
  is_eligible: true,
  is_blacklisted: false,
};

export const MOCK_SESSIONS: Session[] = [
  {
    id: "sess-001",
    ip: "105.108.45.12",
    userAgent: "Chrome 120 — Windows 10",
    createdAt: "2024-12-15T09:23:00",
    isCurrent: true,
  },
  {
    id: "sess-002",
    ip: "105.108.45.12",
    userAgent: "Firefox 121 — Ubuntu 22.04",
    createdAt: "2024-12-14T16:47:00",
    isCurrent: false,
  },
  {
    id: "sess-003",
    ip: "41.200.12.88",
    userAgent: "Chrome 119 — Android 13",
    createdAt: "2024-12-13T08:05:00",
    isCurrent: false,
  },
];

export const WILAYAS = [
  "Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra","Béchar",
  "Blida","Bouira","Tamanrasset","Tébessa","Tlemcen","Tiaret","Tizi Ouzou","Alger",
  "Djelfa","Jijel","Sétif","Saïda","Skikda","Sidi Bel Abbès","Annaba","Guelma",
  "Constantine","Médéa","Mostaganem","M'Sila","Mascara","Ouargla","Oran","El Bayadh",
  "Illizi","Bordj Bou Arréridj","Boumerdès","El Tarf","Tindouf","Tissemsilt",
  "El Oued","Khenchela","Souk Ahras","Tipaza","Mila","Aïn Defla","Naâma",
  "Aïn Témouchent","Ghardaïa","Relizane",
];