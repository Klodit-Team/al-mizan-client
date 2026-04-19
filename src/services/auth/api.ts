import { apiClient } from '@/services/client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: 'SERVICE_CONTRACTANT' | 'OPERATEUR_ECONOMIQUE';
  langue: 'fr' | 'ar';
  nom: string;
  prenom: string;
  telephone?: string;
  denomination?: string;
  nif?: string;
  nis?: string;
  registre_commerce?: string;
  type?: 'EPA' | 'EPIC' | 'MINISTERE' | 'ENTREPRISE_PRIVEE' | 'ENTREPRISE_PUBLIQUE' | 'GROUPEMENT';
  code_service?: string;
}

export interface RegisterResponse {
  message: string;
  user_id: string;
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
