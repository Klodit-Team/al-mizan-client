export type OrgType = "EPA" | "EPIC" | "MINISTERE" | "ENTREPRISE_PRIVEE" | "ENTREPRISE_PUBLIQUE" | "GROUPEMENT";
export type OrgStatus = "verified" | "pending" | "rejected";

export interface Organisation {
    id: string;
    denomination: string;
    nif: string;
    nis: string;
    registre_commerce: string;
    adresse: string;
    wilaya: string;
    commune: string;
    telephone?: string;
    email: string;
    type: OrgType;
    is_verified: boolean;
    created_at: string;
    updated_at?: string;
}

export interface User {
    id: string;
    username: string;
    email: string;
    role: "ADMIN" | "SERVICE_CONTRACTANT" | "OPERATEUR_ECONOMIQUE" | "MEMBRE_COMMISSION" | "CONTROLEUR";
    organisation_id: string;
    created_at: string;
    is_active: boolean;
}