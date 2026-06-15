# Admin Services Folder Analysis

## Overview
The admin services folder (`src/services/admin/`) contains 13 files that handle API interactions for the admin dashboard. The architecture uses TypeScript with strongly-typed entities, DTOs, and React Query integration (via `keys.ts`, `queries.ts`, `mutations.ts`).

---

## Detailed File Analysis

### 1. **audit.ts** - Audit Logging & Integrity Verification
**Purpose:** System audit trail and blockchain-like integrity checking

**Types/Interfaces/Enums:**
- `AuditLog` - Full audit log entry with user action, entity tracking, IP, user agent, SHA256 hashing
- `AuditIntegrityResult` - Result of integrity verification checks
- `ListAuditLogsParams` - Query parameters for filtering audit logs

**API Functions:**
| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `getAdminAuditLogs()` | GET | `/api/v1/audit/logs` | List audit logs with filters (user, action, entity, date range) |
| `getAdminAuditLogById()` | GET | `/api/v1/audit/logs/{id}` | Get single audit log by ID |
| `getAuditLogsByEntite()` | GET | `/api/v1/audit/logs/entite/{entite}/{entiteId}` | Get audit history for specific entity |
| `verifyAdminAuditIntegrity()` | GET | `/api/v1/integrity/verify` | Trigger manual integrity check |
| `getAdminAuditIntegrityStatus()` | GET | `/api/v1/integrity/status` | Get last integrity check report |

---

### 2. **commissions.ts** - Commission Management (Procurements)
**Purpose:** Manage commissions de marché (procurement commissions)

**Types/Interfaces/Enums:**
- `TypeMarche` - Enum: "TRAVAUX" | "FOURNITURES" | "SERVICES"
- `CommissionStatut` - Enum: "EN_COURS" | "DELIBERATION" | "ATTRIBUEE" | "ANNULEE" | "INFRUCTUEUSE"
- `RoleMembreMarche` - Enum: "PRESIDENT" | "MEMBRE" | "RAPPORTEUR" | "CONTROLEUR" | "OBSERVATEUR"
- `MembreMarche` - Member of a commission with role and nomination date
- `CommissionMarche` - Full commission entity with members, dates, status
- `PaginatedCommissions` - Paginated response wrapper
- `CommissionMarcheDto` - DTO for create/update
- `UpdateCommissionMarcheDto` - Partial update DTO
- `ChangeStatutDto` - DTO for status changes
- `ListCommissionsParams` - Query parameters

**API Functions:**
| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `listCommissionsMarche()` | GET | `/api/v1/commissions-marche` | List all commissions (paginated & filtered) |
| `createCommissionMarche()` | POST | `/api/v1/commissions-marche` | Create new commission |
| `getCommissionMarcheById()` | GET | `/api/v1/commissions-marche/{id}` | Get single commission |
| `updateCommissionMarche()` | PUT | `/api/v1/commissions-marche/{id}` | Full update commission |
| `deleteCommissionMarche()` | DELETE | `/api/v1/commissions-marche/{id}` | Delete commission |
| `changeCommissionMarcheStatut()` | PATCH | `/api/v1/commissions-marche/{id}/statut` | Change commission status |

**Aliases:** `getAdminCommissions`, `createAdminCommission`, `updateAdminCommission`, `deleteAdminCommission`, `changeAdminCommissionStatus`

---

### 3. **incidents.ts** - AI Incident Tracking
**Purpose:** Track and manage AI decision divergences and errors

**Types/Interfaces/Enums:**
- `IncidentType` - Enum: "DIVERGENCE_GRE_A_GRE" | "DIVERGENCE_EVALUATION" | "ERREUR_IA" | "CONFIANCE_FAIBLE"
- `IncidentStatut` - Enum: "OUVERT" | "EN_ANALYSE" | "RESOLU" | "IGNORE"
- `IncidentGravite` - Enum: "FAIBLE" | "MOYENNE" | "ELEVEE" | "CRITIQUE"
- `AIIncident` - Full incident entity with AI/human decisions, confidence scores, resolution notes
- `CreateIncidentDto` - DTO for reporting new incident
- `ResolveIncidentDto` - DTO for resolving incident (with notes)
- `UpdateIncidentStatutDto` - DTO for status updates
- `ListIncidentsParams` - Query parameters

**API Functions:**
| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `getAdminIncidents()` | GET | `/api/v1/incidents` | List incidents with filters (type, status, severity, date) |
| `getAdminIncidentById()` | GET | `/api/v1/incidents/{id}` | Get single incident |
| `createAdminIncident()` | POST | `/api/v1/incidents` | Report new AI incident |
| `resolveAdminIncident()` | PATCH | `/api/v1/incidents/{id}/resolve` | Resolve incident with human decision |
| `updateAdminIncidentStatut()` | PATCH | `/api/v1/incidents/{id}/statut` | Update incident status without resolving |

---

### 4. **organisations.ts** - Organisation/Company Management
**Purpose:** Manage organisations (economic operators, enterprises, ministries)

**Types/Interfaces/Enums:**
- `OrgType` - Enum: "EPA" | "EPIC" | "MINISTERE" | "ENTREPRISE_PRIVEE" | "ENTREPRISE_PUBLIQUE" | "GROUPEMENT"
- `OrganisationEntity` - Full organisation with NIF, NIS, registration number, location, verification status
- `PaginatedOrganisations` - Paginated response wrapper
- `ListOrganisationsParams` - Query parameters

**API Functions:**
| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `listOrganisations()` | GET | `/api/v1/organisations` | List organisations (paginated, filterable by type, verification status) |
| `getOrganisationById()` | GET | `/api/v1/organisations/{id}` | Get single organisation |
| `verifyOrganisation()` | PATCH | `/api/v1/organisations/{id}/verify` | Mark organisation as verified |
| `updateOrganisation()` | PATCH | `/api/v1/organisations/{id}` | Update organisation details |
| `deleteOrganisation()` | DELETE | `/api/v1/organisations/{id}` | Delete organisation |

---

### 5. **users.ts** - User Profile & Role Management
**Purpose:** Manage user profiles and role assignments (not authentication users, but admin users)

**Types/Interfaces/Enums:**
- `CreateProfileDto` - DTO for creating user profile
- `UpdateProfileDto` - Partial DTO for updating profile
- Imports external types from `@/components/dashboard/admin/users/types`:
  - `ProfileEntity`
  - `RoleEntity`
  - `AssignRoleDto`
  - `UserRoleEntity`

**API Functions:**
| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `createUserProfile()` | POST | `/api/v1/profiles` | Create user profile |
| `getProfileByUserId()` | GET | `/api/v1/profiles/user/{userId}` | Get profile by auth user ID |
| `updateProfileByUserId()` | PATCH | `/api/v1/profiles/user/{userId}` | Update profile by auth user ID |
| `getProfileById()` | GET | `/api/v1/profiles/{id}` | Get profile by profile ID |
| `updateProfileById()` | PATCH | `/api/v1/profiles/{id}` | Update profile by profile ID |
| `deleteProfile()` | DELETE | `/api/v1/profiles/{id}` | Delete profile |
| `getAdminUserProfiles()` | GET | `/api/v1/profiles` | Fetch all profiles for admin user list |
| `getAdminRoles()` | GET | `/api/v1/users/roles` | Get all available system roles |
| `assignUserRole()` | POST | `/api/v1/users/user-roles` | Assign role to user |
| `getUserRoles()` | GET | `/api/v1/users/user-roles/{userId}` | Get all role assignments for user |

---

### 6. **profile.ts** - Admin Profile Management
**Purpose:** Admin-specific profile management (similar to users.ts but focused on admin context)

**Types/Interfaces/Enums:**
- `AdminProfileEntity` - Profile entity with nom, prenom, telephone, langue
- `UpdateAdminProfileInput` - Partial DTO for updating admin profile

**API Functions:**
| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `getAdminProfile()` | GET | `/api/v1/profiles/user/{userId}` | Get admin profile by auth user ID |
| `updateAdminProfile()` | PATCH | `/api/v1/profiles/user/{userId}` | Update admin profile by auth user ID |
| `getAdminProfileById()` | GET | `/api/v1/profiles/{id}` | Get admin profile by profile ID |
| `updateAdminProfileById()` | PATCH | `/api/v1/profiles/{id}` | Update admin profile by profile ID |

---

### 7. **notifications.ts** - Notification System
**Purpose:** Manage system notifications across the platform

**Types/Interfaces/Enums:**
- `NotificationType` - Enum: "EMAIL" | "SMS" | "PUSH" | "PLATEFORME"
- `NotificationCategorie` - Enum: "PUBLICATION" | "DEPOT" | "OUVERTURE" | "EVALUATION" | "ATTRIBUTION" | "RECOURS" | "SYSTEME" | "IA_DIVERGENCE" | "IA_ERREUR"
- `NotificationStatut` - Enum: "EN_ATTENTE" | "ENVOYE" | "ECHEC" | "LU"
- `NotificationEntity` - Full notification with user, recipient, status, delivery attempts, error details
- `PaginatedNotifications` - Paginated response wrapper
- `ListNotificationsParams` - Query parameters

**API Functions:**
| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `listNotifications()` | GET | `/notification-service/v1/notifications` | List notifications (admin/controleur role required) |
| `getNotificationById()` | GET | `/notification-service/v1/notifications/{id}` | Get single notification |
| `markNotificationRead()` | PATCH | `/notification-service/v1/notifications/{id}/lire` | Mark notification as read |
| `markAllNotificationsRead()` | PATCH | `/notification-service/v1/notifications/marquer-toutes-lues` | Mark all notifications as read |
| `getUnreadNotificationsCount()` | GET | `/notification-service/v1/notifications/non-lues/count` | Count unread notifications |

---

### 8. **operateurs.ts** - Economic Operators (Contractors) Management
**Purpose:** Manage economic operators and their eligibility/blacklisting

**Types/Interfaces/Enums:**
- `OperateurEconomiqueEntity` - Backend entity with organisation/user references, qualifications, categories, eligibility, blacklist status
- `AdminOperateur` - UI-facing type with flattened user/org data

**API Functions:**
| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `getAdminOperateurs()` | GET | `/api/v1/operateurs-economiques` | List all operateurs (falls back to dummy data if unavailable) |
| `blacklistAdminOperateur()` | PATCH | `/api/v1/operateurs-economiques/{id}/blacklist` | Blacklist operateur with reason |
| `unblacklistAdminOperateur()` | PATCH | `/api/v1/operateurs-economiques/{id}/unblacklist` | Remove operateur from blacklist |

---

### 9. **sessions.ts** - Session Management
**Purpose:** Manage active user sessions for security auditing

**Types/Interfaces/Enums:**
- `ActiveSession` - Session entity with device info, IP address, creation/expiration times

**API Functions:**
| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `listActiveSessions()` | GET | `/api/v1/auth/sessions` | Get all active sessions for authenticated user |
| `revokeSession()` | DELETE | `/api/v1/auth/sessions/{id}` | Terminate specific session |

---

## Logical Groupings & Recommendations

### **Group 1: Identity & Access Control**
**Related Files:** `users.ts`, `profile.ts`, `sessions.ts`

**Why together:**
- All manage user identity, profiles, and access
- `users.ts` handles role assignments
- `profile.ts` manages profile data
- `sessions.ts` tracks active sessions

**Recommendation:** Consider creating a unified `identity.ts` or `access-control.ts` file that consolidates these concerns.

```typescript
// Suggested structure:
export * from "./identity/profiles";      // user profiles
export * from "./identity/roles";         // role management
export * from "./identity/sessions";      // session management
```

---

### **Group 2: Data Governance & Compliance**
**Related Files:** `audit.ts`, `incidents.ts`

**Why together:**
- Both track system events and anomalies
- `audit.ts` provides forensic logging
- `incidents.ts` tracks AI decision quality issues
- Both support compliance and transparency

**Recommendation:** Create a `governance.ts` file that consolidates audit and incident management:

```typescript
// governance.ts structure:
export * from "./audit";       // audit logs
export * from "./incidents";   // AI incidents
```

---

### **Group 3: Entity Management (CRUD)**
**Related Files:** `organisations.ts`, `operateurs.ts`

**Why together:**
- Both manage external entities (organisations/contractors)
- Similar CRUD patterns
- `organisations.ts` manages legal entities
- `operateurs.ts` manages economic operators (who are linked to organisations)

**Recommendation:** Consider a `entities.ts` namespace:

```typescript
// entities/organisations.ts
// entities/operateurs.ts
```

---

### **Group 4: Procurement & Commissions**
**Related Files:** `commissions.ts`

**Status:** Already well-isolated. This is domain-specific business logic for procurement commission management.

**No change needed** - the file is appropriately focused.

---

### **Group 5: Communication & Notifications**
**Related Files:** `notifications.ts`

**Status:** Already well-isolated. This handles all notification delivery across the platform.

**No change needed** - the file is appropriately focused.

---

## Current Architecture Summary

| Category | Files | Purpose |
|----------|-------|---------|
| **Identity & Access** | users.ts, profile.ts, sessions.ts | User profiles, roles, session management |
| **Compliance & Governance** | audit.ts, incidents.ts | Audit trails, AI incident tracking |
| **Entity Management** | organisations.ts, operateurs.ts | Organisation & contractor management |
| **Procurement** | commissions.ts | Commission de marché management |
| **Communication** | notifications.ts | Notification delivery |
| **Infrastructure** | index.ts, keys.ts, queries.ts, mutations.ts | RE-exports, React Query integration |

---

## Refactoring Recommendations

### **Priority 1: Consolidate Identity & Access**
Current:
- `users.ts` - profiles, roles, assignments
- `profile.ts` - admin-specific profile operations
- `sessions.ts` - session management

**Issue:** `users.ts` and `profile.ts` have overlapping endpoints (both use `/api/v1/profiles`). This creates confusion.

**Recommendation:**
```
admin/
├── identity/
│   ├── profiles.ts         (all profile operations)
│   ├── roles.ts            (role management)
│   └── sessions.ts         (session management)
├── index.ts                (re-exports from identity/*)
```

### **Priority 2: Separate Backend Service Boundaries**
Notice that `notifications.ts` uses `/notification-service/v1/` while others use `/api/v1/`. This suggests a separate backend service.

**Current structure handles this correctly** - keep it isolated.

### **Priority 3: Add Response Wrappers**
Some functions return `Promise<void>` (e.g., `revokeSession()`). Consider standardized response types:

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
```

---

## Type Imports Summary

**External imports in user-facing files:**
- `users.ts` imports from `@/components/dashboard/admin/users/types`
  - `ProfileEntity`, `RoleEntity`, `AssignRoleDto`, `UserRoleEntity`

**Internal types:** All defined within their respective service files

---

## Query/Mutation Hooks Integration

### **Supported Queries** (in `queries.ts`):
- `useOrganisationsQuery()` - organisations list
- `useOrganisationDetailQuery()` - single organisation
- `useCommissionsQuery()` - commissions list
- `useIncidentsQuery()` - incidents list
- `useAuditQuery()` - audit logs
- `useIntegrityStatusQuery()` - integrity status

### **Supported Mutations** (in `mutations.ts`):
- Organisations: verify, update, delete
- Commissions: create, update status, update, delete
- Incidents: resolve, update status
- Audit: verify integrity

**Note:** User/profile and notification mutations are NOT integrated yet. Consider adding them.

---

## Conclusion

The admin services folder is **well-structured** with clear separation of concerns. The main improvement would be consolidating the overlapping identity/access control files and ensuring all mutations are exposed via React Query hooks.

**No urgent refactoring needed** - the current structure is maintainable and follows TypeScript best practices.
