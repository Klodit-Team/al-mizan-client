export interface User {
    id: string;
    username: string;
    email: string;
    role: "ADMIN" | "SERVICE_CONTRACTANT" | "OPERATEUR_ECONOMIQUE" | "MEMBRE_COMMISSION" | "CONTROLEUR";
    organisation_id: string;
    created_at: string;
    is_active: boolean;
}
