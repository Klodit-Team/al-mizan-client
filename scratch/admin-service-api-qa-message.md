# Backend QA Message - Admin Service APIs

Bonjour team backend,

I reviewed the current frontend admin service integration and I need confirmation of the API contracts so I can adapt the UI correctly and display data based on the real backend responses.



5. Please confirm all date fields are ISO strings, for example `2026-05-17T10:30:00.000Z`.

6. Please confirm enum values exactly as strings, because the frontend maps labels from them.

## API contracts to confirm

### 1. Admin dashboard stats

Endpoint currently used:

`GET /api/dashboard/admin/stats`

Expected response:

```json
{
  "utilisateursActifs": 12,
  "aoEnCours": 5,
  "recoursOuverts": 2,
  "incidentsIA": 1
}
```

Questions:

- Is this endpoint path correct?
- Are these counts global platform counts or only admin-scoped counts?
- Can all fields always be returned as numbers, even when value is `0`?

### 2. Users

Endpoint currently used:

`GET /users/profiles`

Frontend expects:

```json
[
  {
    "id": "user-id",
    "username": "Name",
    "email": "user@example.com",
    "role": "ADMIN",
    "organisation_id": "org-id",
    "created_at": "2026-05-17T10:30:00.000Z",
    "is_active": true,
    "is_blacklisted": false,
    "blacklist_motif": null
  }
]
```

Questions:

- Is the response a raw array or paginated object?
- Should search/filter by role be done frontend-side or backend-side with query params?
- Are possible roles exactly: `ADMIN`, `SERVICE_CONTRACTANT`, `OPERATEUR_ECONOMIQUE`, `MEMBRE_COMMISSION`, `CONTROLEUR`?
- Is `organisation_id` always present?

Role update endpoint currently used:

`POST or PATCH /users/user-roles/{userId}`

Current frontend body:

```json
{
  "role": "SERVICE_CONTRACTANT"
}
```

Questions:

- Which method is correct: `POST`, `PATCH`, or `PUT`?
- What should the response be: updated user, updated role object, or no body?

Generic user blacklist endpoint currently seen in frontend service:

`POST /api/admin/users/{userId}/blacklist`

Body:

```json
{
  "motif": "Reason"
}
```

Unblacklist:

`DELETE /api/admin/users/{userId}/blacklist`

Questions:

- Are these endpoints real, or should the frontend use only the operator blacklist endpoints?
- Should `userId` be the user `id` or the operator profile `id`?

### 3. Organisations

List endpoint currently used:

`GET /users/organisations`

Frontend expects:

```json
[
  {
    "id": "org-id",
    "denomination": "Organisation name",
    "nif": "123456789012345",
    "nis": "12345678901234",
    "registre_commerce": "RC-2026-001",
    "adresse": "Address",
    "wilaya": "Alger",
    "commune": "Kouba",
    "telephone": "+213...",
    "email": "contact@example.dz",
    "type": "MINISTERE",
    "is_verified": false,
    "created_at": "2026-05-17T10:30:00.000Z",
    "updated_at": "2026-05-17T10:30:00.000Z"
  }
]
```

Details endpoint currently used:

`GET /users/organisations/{orgId}`

Frontend expects:

```json
{
  "organisation": {
    "id": "org-id",
    "denomination": "Organisation name",
    "nif": "123456789012345",
    "nis": "12345678901234",
    "registre_commerce": "RC-2026-001",
    "adresse": "Address",
    "wilaya": "Alger",
    "commune": "Kouba",
    "telephone": "+213...",
    "email": "contact@example.dz",
    "type": "MINISTERE",
    "is_verified": false,
    "created_at": "2026-05-17T10:30:00.000Z",
    "updated_at": "2026-05-17T10:30:00.000Z"
  },
  "users": [
    {
      "id": "user-id",
      "username": "Name",
      "email": "user@example.com",
      "role": "SERVICE_CONTRACTANT",
      "organisation_id": "org-id",
      "created_at": "2026-05-17T10:30:00.000Z",
      "is_active": true
    }
  ]
}
```

Verify endpoint currently used:

`PATCH /users/organisations/{orgId}/verify`

Questions:

- Is the organisation list raw or paginated?
- Are possible organisation types exactly: `EPA`, `EPIC`, `MINISTERE`, `ENTREPRISE_PRIVEE`, `ENTREPRISE_PUBLIQUE`, `GROUPEMENT`?
- Does verify return the updated organisation or no body?
- Is there a reject organisation endpoint? The UI has a reject action but no backend endpoint yet.
- If rejected, what field should the UI display: `status`, `is_verified`, `rejection_reason`, etc.?

### 4. Operators

Endpoint currently used:

`GET /users/operateurs-economiques`

Frontend expects:

```json
[
  {
    "id": "operator-profile-id",
    "organisation_id": "org-id",
    "user_id": "user-id",
    "qualifications": ["..."],
    "categories": ["..."],
    "is_eligible": true,
    "is_blacklisted": false,
    "username": "Name",
    "email": "user@example.com",
    "role": "OPERATEUR_ECONOMIQUE",
    "created_at": "2026-05-17T10:30:00.000Z",
    "is_active": true,
    "blacklist_motif": null
  }
]
```

Blacklist endpoint currently used:

`PATCH /users/operateurs-economiques/{userId}/blacklist`

Body:

```json
{
  "motif": "Reason"
}
```

Unblacklist endpoint:

`PATCH /users/operateurs-economiques/{userId}/unblacklist`

Questions:

- Should the path param be `userId` or operator profile `id`?
- Does blacklist/unblacklist return updated operator, updated user, or no body?
- Should `is_active` change when an operator is blacklisted, or should the UI rely only on `is_blacklisted`?
- Are `username` and `email` included in this endpoint, or do we need to join with `/users/profiles`?

### 5. Commissions marche

Base path currently used:

`/commissions-marche`

List:

`GET /commissions-marche/`

Create:

`POST /commissions-marche/`

Body:

```json
{
  "designation": "Commission name",
  "type": "EVALUATION",
  "niveau": "NATIONALE",
  "appel_offre_id": "ao-id"
}
```

Detail:

`GET /commissions-marche/{id}`

Update:

`PUT /commissions-marche/{id}`

Body:

```json
{
  "designation": "Updated name",
  "type": "MARCHE",
  "niveau": "WILAYA",
  "appel_offre_id": "ao-id"
}
```

Delete:

`DELETE /commissions-marche/{id}`

Change status:

`PATCH /commissions-marche/{id}/statut`

Body:

```json
{
  "statut": "ACTIVE"
}
```

Frontend expects commission response:

```json
{
  "id": "commission-id",
  "appel_offre_id": "ao-id",
  "type": "EVALUATION",
  "designation": "Commission name",
  "niveau": "NATIONALE",
  "statut": "CONSTITUEE",
  "date_constitution": "2026-05-17T10:30:00.000Z",
  "created_at": "2026-05-17T10:30:00.000Z"
}
```

Questions:

- Is `/commissions-marche` the final admin path?
- Are possible `type` values exactly `EVALUATION`, `MARCHE`?
- Are possible `niveau` values exactly `NATIONALE`, `SECTORIELLE`, `WILAYA`, `COMMUNALE`?
- Are possible `statut` values exactly `CONSTITUEE`, `ACTIVE`, `DISSOUTE`?
- Is `appel_offre_id` optional for all commission types?
- Does create/update/status return the updated commission object?

### 6. Sessions

Endpoint currently used:

`GET /auth/sessions`

Frontend normalizes several possible shapes, but ideal response is:

```json
[
  {
    "id": "session-id",
    "userId": "user-id",
    "ip": "196.20.12.45",
    "userAgent": "Mozilla/5.0 ...",
    "createdAt": "2026-05-17T10:30:00.000Z",
    "lastActivity": "2026-05-17T11:00:00.000Z",
    "expiresAt": "2026-05-18T10:30:00.000Z"
  }
]
```

Revoke endpoint:

`DELETE /auth/sessions/{sessionId}`

Questions:

- Is this endpoint admin-only and does it list all active platform sessions?
- Are field names camelCase or snake_case?
- Does revoke return no body or a success object?

### 7. Audit logs

Endpoint currently used:

`GET /audit/logs`

Frontend expects:

```json
[
  {
    "user_id": "user-id",
    "action": "LOGIN",
    "entity": "system",
    "entity_id": "system",
    "ip_address": "192.168.1.10",
    "hash_sha256": "abc123",
    "hash_precedent": "def456",
    "user": "Display name",
    "role": "ADMIN",
    "target": "System",
    "date": "2026-05-17T10:30:00.000Z"
  }
]
```

Integrity endpoint:

`GET /audit/integrity`

Frontend expects:

```json
{
  "valid": true
}
```

Questions:

- Is audit log response raw or paginated?
- Can backend support filters for user/action/date, or should frontend filter locally?
- Please confirm possible `action` values. Current UI has: `LOGIN`, `UPDATE_AO`, `CREATE_USER`, `DELETE_USER`, `VIEW_REPORT`, `EXPORT_DATA`, `UPDATE_SETTINGS`.
- Should `date` be returned, or should UI use `created_at`?

### 8. AI incidents

Endpoint currently used:

`GET /audit/incidents`

Frontend expects:

```json
[
  {
    "incidentId": "INC-2026-001",
    "utilisateursCibles": ["user-id"],
    "titre": "Anomaly detected",
    "message": "Details...",
    "niveauUrgence": "CRITICAL",
    "typeAlerte": "DIVERGENCE_GRE_A_GRE",
    "donneesContexte": {
      "lotId": "LOT-3"
    },
    "statut": "EMISE",
    "created_at": "2026-05-17T10:30:00.000Z"
  }
]
```

Resolve endpoint:

`PATCH /audit/incidents/{incidentId}/resolve`

Body:

```json
{
  "statut": "RESOLVED",
  "resolutionNotes": "Resolution explanation"
}
```

Questions:

- Are field names intentionally camelCase/French mixed, for example `incidentId`, `utilisateursCibles`, `niveauUrgence`?
- Are possible urgency values exactly `INFO`, `WARNING`, `ERROR`, `CRITICAL`?
- What are possible status values: only `EMISE` and `RESOLVED`, or more?
- Does resolve return the updated incident or no body?

### 9. Notifications

Endpoint currently used:

`GET /notifications`

Frontend expects:

```json
[
  {
    "id": "notification-id",
    "category": "systeme",
    "title": "Notification title",
    "description": "Notification body",
    "time": "2026-05-17T10:30:00.000Z",
    "read": false
  }
]
```

Mark one as read:

`PATCH /notifications/{id}/lire`

Mark all as read:

`PATCH /notifications/marquer-toutes-lues`

Questions:

- Are notifications admin-only for the current logged-in admin?
- Is `time` an ISO date string, a relative string, or should the field be `created_at`?
- Are possible categories exactly: `publication_ao`, `depot_confirme`, `ouverture_plis`, `evaluation_resultat`, `attribution_provisoire`, `attribution_definitive`, `recours_update`, `systeme`?
- Do mark-read endpoints return updated notification(s) or no body?

### 10. Admin profile

Endpoint currently used:

`PATCH /api/admin/profile`

Request content type:

`multipart/form-data`

Fields:

```text
username: string
email: string
currentPassword?: string
newPassword?: string
avatar?: File
```

Frontend expects:

```json
{
  "id": "admin-id",
  "username": "Admin name",
  "email": "admin@example.dz",
  "avatarUrl": "https://..."
}
```

Questions:

- Is this the correct endpoint path?
- Should password update happen on the same endpoint or a separate endpoint?
- What are avatar constraints: max size, allowed MIME types, storage URL field name?
- Does frontend need a `GET /api/admin/profile` endpoint to prefill real admin data?

## Frontend integration blockers found

1. Please confirm whether admin paths need `/api/v1` prefix. The frontend `apiClient` does not add `/api/v1` automatically; it only appends the given path to `NEXT_PUBLIC_API_URL`.

2. The role update frontend currently has a typo in method (`POS`). I will fix it after backend confirms the correct method.

3. The organisation reject action exists in UI but no backend endpoint is currently known.

4. Generic user blacklist endpoints and operator blacklist endpoints are both present in frontend services. Please confirm which one should be used.

Thanks. Once you confirm the contracts above, I can align the frontend types, requests, response parsing, pagination, and display states.
