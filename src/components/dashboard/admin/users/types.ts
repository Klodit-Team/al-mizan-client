// Matches backend ProfileEntity
export type SupportedLanguage = 'ar' | 'fr';

export interface ProfileEntity {
  id: string;
  userId: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  langue: SupportedLanguage;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// Matches backend UserRoleEntity
export interface UserRoleEntity {
  id: string;
  userId: string;
  roleId: string;
  assignedAt: string; // ISO 8601
}

// Matches backend AssignRoleDto
export interface AssignRoleDto {
  userId: string; // UUID
  roleId: string; // UUID
}

// Matches backend RoleEntity returned by GET /roles
export interface RoleEntity {
  id: string;
  name: 'ADMIN' | 'SERVICE_CONTRACTANT' | 'OPERATEUR_ECONOMIQUE' | 'MEMBRE_COMMISSION' | 'CONTROLEUR';
}

// UI representation used by the component
export interface User {
  id: string;           // profile.id
  userId: string;       // profile.userId — used for role assignments
  username: string;     // prenom + ' ' + nom
  nom: string;
  prenom: string;
  telephone: string | null;
  langue: SupportedLanguage;
  email: string;        // loaded from auth /me or supplementary endpoint
  role: 'ADMIN' | 'SERVICE_CONTRACTANT' | 'OPERATEUR_ECONOMIQUE' | 'MEMBRE_COMMISSION' | 'CONTROLEUR';
  roleId: string;       // UUID — needed for AssignRoleDto
  createdAt: string;    // ISO 8601 (from ProfileEntity)
  is_active: boolean;
  is_blacklisted?: boolean;
  blacklist_motif?: string;
}
