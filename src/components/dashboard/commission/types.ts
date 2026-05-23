export type CommissionStatut = "ACTIVE" | "CONSTITUEE" | "DISSOUTE";

export type MembreRole = "Président" | "Évaluateur" | "Rapporteur" | "Membre" | "Observateur";

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

export interface CommissionDict {
    title: string;
    subtitle: string;
    stats: {
        total?: string;
        totalPlural: string;
        active: string;
        constituee: string;
        dissoute: string;
    };
    searchPlaceholder: string;
    filters: Record<string, string>;
    columns: {
        designation: string;
        appelOffre: string;
        monRole: string;
        dateConstitution: string;
        statut: string;
        actions: string;
    };
    noResults?: string;
    noResultsSub?: string;
    noCommissions?: string;
    noCommissionsSub?: string;
    resetFilters?: string;
    resultsCountPlural?: string;
    resultsCount?: string;
    filtered?: string;
    roles?: Record<string, string>;
    statuts?: Record<string, string>;
    actions?: string;
}
