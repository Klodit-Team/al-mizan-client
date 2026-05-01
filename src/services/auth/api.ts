import { apiClient } from '@/services/client';

export type AuthRoleName =
  | 'ADMIN'
  | 'SERVICE_CONTRACTANT'
  | 'OPERATEUR_ECONOMIQUE'
  | 'MEMBRE_COMMISSION'
  | 'CONTROLEUR';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  role?: AuthRoleName;
  userType?: AuthRoleName | 'admin' | 'contractant' | 'operateur';
  user?: {
    role?: AuthRoleName;
    userType?: AuthRoleName | 'admin' | 'contractant' | 'operateur';
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: 'SERVICE_CONTRACTANT' | 'OPERATEUR_ECONOMIQUE';
  langue: 'fr' | 'ar';
  nom: string;
  prenom: string;
  telephone?: string;
  denomination: string;
  nif?: string;
  nis?: string;
  registre_commerce?: string;
  adresse?: string;
  wilaya?: string;
  commune?: string;
  type: 'EPA' | 'EPIC' | 'MINISTERE' | 'ENTREPRISE_PRIVEE' | 'ENTREPRISE_PUBLIQUE' | 'GROUPEMENT';
  code_service?: string;
  secteur_activite?: string;
  ordonnateur?: string;
  qualifications?: string;
  categories?: string;
}

export interface RegisterResponse {
  message: string;
  user_id: string;
}

export interface MeResponse {
  user?: {
    userId?: string;
    email?: string;
    role?: AuthRoleName;
    userType?: AuthRoleName | 'admin' | 'contractant' | 'operateur';
  };
}

export interface UserRoleAssignment {
  id: string;
  role?: {
    id?: string;
    name?: AuthRoleName;
  };
}

const AUTH_BASE_PATH = '/api/v1/auth';

export function login(payload: LoginRequest): Promise<LoginResponse> {
  return apiClient<LoginResponse>(`${AUTH_BASE_PATH}/login`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function register(payload: RegisterRequest): Promise<RegisterResponse> {
  return apiClient<RegisterResponse>(`${AUTH_BASE_PATH}/register`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser(): Promise<MeResponse> {
  return apiClient<MeResponse>(`${AUTH_BASE_PATH}/me`, {
    method: 'GET',
  });
}

export function logout(): Promise<void> {
  return apiClient<void>(`${AUTH_BASE_PATH}/logout`, {
    method: 'POST',
  });
}

export function listCurrentUserRoles(userId: string): Promise<UserRoleAssignment[]> {
  return apiClient<UserRoleAssignment[]>(`${AUTH_BASE_PATH}/users/user-roles/${userId}`, {
    method: 'GET',
  });
}
