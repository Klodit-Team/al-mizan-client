export type CommissionType = 'EVALUATION' | 'MARCHE';
export type CommissionNiveau = 'NATIONALE' | 'SECTORIELLE' | 'WILAYA' | 'COMMUNALE';
export type CommissionStatut = 'CONSTITUEE' | 'ACTIVE' | 'DISSOUTE';

export interface Commission {
    id: string;
    appel_offre_id?: string;
    type: CommissionType;
    designation: string;
    niveau: CommissionNiveau;
    statut: CommissionStatut;
    date_constitution: string;
    created_at: string;
}

export interface CommissionFormData {
    designation: string;
    type: CommissionType;
    niveau: CommissionNiveau;
    appel_offre_id: string;
}
