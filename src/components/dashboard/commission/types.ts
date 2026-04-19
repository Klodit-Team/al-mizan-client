export type CommissionStatut = "ACTIVE" | "CONSTITUEE" | "DISSOUTE";

export type MembreRole = "Président" | "Évaluateur" | "Rapporteur" | "Membre";

export interface MembreCommission {
    id: string;
    designation: string;
    appelOffre: {
        id: string;
        reference: string;
        objet: string;
    };
    monRole: MembreRole;
    dateConstitution: string;
    statut: CommissionStatut;
}
