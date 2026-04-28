export interface SoumissionRetenue {
    id: string;
    soumissionnaire: {
        nom: string;
        acronyme: string;
    };
    scoreTechnique: number;
    montantFinancier: number | null; // null if not yet decrypted
}

export type CommissionRole = 'membre' | 'president';

export interface OuverturePlisSelectedAO {
    id: string;
    reference: string;
    objet: string;
}
