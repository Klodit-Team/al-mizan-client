// Matches backend OrganisationEntity exactly
export type OrgType =
  | "EPA"
  | "EPIC"
  | "MINISTERE"
  | "ENTREPRISE_PRIVEE"
  | "ENTREPRISE_PUBLIQUE"
  | "GROUPEMENT";

export interface Organisation {
  id: string;
  denomination: string;
  nif: string;
  nis: string;
  registreCommerce: string;   // camelCase — matches backend
  adresse: string;
  wilaya: string;
  commune: string;
  telephone: string;
  email: string;
  type: OrgType;
  isVerified: boolean;        // camelCase — matches backend
  createdAt: string;          // camelCase — matches backend ISO 8601
  updatedAt: string;          // camelCase — matches backend ISO 8601
}