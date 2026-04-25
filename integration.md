# Frontend Integration Guide

## Goal
This document explains how API integration is implemented in the frontend, using the current auth flow as the reference pattern.

If you add new domains (tenders, documents, notifications, etc.), follow the same structure and React Query logic used in auth.

## Tech and runtime conventions
- App framework: Next.js App Router
- Data layer: React Query (`@tanstack/react-query`)
- HTTP client: shared `apiClient` helper
- Auth transport: cookie-based session (`credentials: 'include'`)
- Validation/UI forms: `react-hook-form` + zod (in form components)

## Existing auth integration structure
Auth integration is split into three files under `src/services/auth/`:
- `api.ts`: endpoint functions and API types
- `keys.ts`: React Query keys
- `queries.ts`: query/mutation hooks

This separation keeps endpoint code, cache key policy, and hook behavior clean and reusable.

## Provider setup (React Query)
React Query is initialized once in `src/components/providers/QueryProvider.tsx` and injected from `src/app/[locale]/layout.tsx`.

Default options currently used:
- `staleTime: 30000`
- `refetchOnWindowFocus: false`

This is the baseline behavior all new query/mutation hooks should assume.

## Shared HTTP client pattern
All API calls should use `src/services/client.ts`.

Key behavior already standardized there:
- Base URL from `NEXT_PUBLIC_API_URL` (fallback to `http://localhost:3000`)
- Always sends JSON headers
- Always includes cookies (`credentials: 'include'`)
- Throws `ApiClientError` with:
  - `status`
  - parsed error `payload`
  - fallback message if backend does not return one

Do not call `fetch` directly from feature forms/components for backend APIs.

## Auth API reference (current)
`src/services/auth/api.ts` currently defines:
- `login(payload)` -> `POST /api/v1/auth/login`
- `register(payload)` -> `POST /api/v1/auth/register`
- `getCurrentUser()` -> `GET /api/v1/auth/me`
- `listCurrentUserRoles(userId)` -> `GET /api/v1/users/user-roles/:userId`

The file also contains all request/response typing used by hooks and forms.

## Auth React Query reference (current)
### Keys
`src/services/auth/keys.ts`
- `authKeys.all`
- `authKeys.loginMutation()`
- `authKeys.registerMutation()`

### Mutations
`src/services/auth/queries.ts`
- `useLoginMutation()`
- `useRegisterMutation()`

Pattern used:
- hook built with `useMutation`
- typed generics `<Response, Error, Payload>`
- uses `mutationKey` from `keys.ts`
- `mutationFn` points to API function from `api.ts`

## UI usage pattern (auth forms)
In form components (example: login/register), integration pattern is:
1. Create mutation hook instance.
2. Call `mutateAsync` inside `onSubmit`.
3. Catch `ApiClientError` to map backend errors to UI states.
4. Keep business flow in component (redirect, lock handling, cookie updates).

Login currently includes role resolution fallback:
- trust role/userType from login payload if present
- otherwise call `/auth/me`, then `/users/user-roles/:userId`
- map role to dashboard user type
- write `user_type` cookie
- redirect to localized dashboard path

## Required pattern for new integrations
For each new backend domain, create:
- `src/services/<domain>/api.ts`
- `src/services/<domain>/keys.ts`
- `src/services/<domain>/queries.ts`

### 1) api.ts
- Define request/response types
- Export pure HTTP functions only
- Use shared `apiClient`
- Keep endpoint paths centralized

Example:

```ts
import { apiClient } from '@/services/client';

export interface CreateItemRequest {
  name: string;
}

export interface CreateItemResponse {
  id: string;
  name: string;
}

const BASE = '/api/v1/items';

export function createItem(payload: CreateItemRequest): Promise<CreateItemResponse> {
  return apiClient<CreateItemResponse>(BASE, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function listItems(): Promise<CreateItemResponse[]> {
  return apiClient<CreateItemResponse[]>(BASE, {
    method: 'GET',
  });
}
```

### 2) keys.ts
- Keep deterministic keys
- Group domain keys in one object

Example:

```ts
export const itemKeys = {
  all: ['items'] as const,
  list: () => [...itemKeys.all, 'list'] as const,
  detail: (id: string) => [...itemKeys.all, 'detail', id] as const,
  createMutation: () => [...itemKeys.all, 'create'] as const,
};
```

### 3) queries.ts
- Expose `useQuery` and `useMutation` hooks only
- Keep cache update/invalidation here (not in forms)

Example:

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createItem, listItems, type CreateItemRequest, type CreateItemResponse } from './api';
import { itemKeys } from './keys';

export function useItemsQuery() {
  return useQuery({
    queryKey: itemKeys.list(),
    queryFn: listItems,
  });
}

export function useCreateItemMutation() {
  const queryClient = useQueryClient();

  return useMutation<CreateItemResponse, Error, CreateItemRequest>({
    mutationKey: itemKeys.createMutation(),
    mutationFn: createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
    },
  });
}
```

## Error handling standard
- Catch `ApiClientError` in UI components
- Prefer backend message (`error.message`) for user feedback
- Use `error.status` for branch logic (401, 403, 404, 409, 429)
- Use `error.payload` for structured extras (attempts remaining, lock reason, field-level details)

## Mutation and query checklist
Before merging any new integration:
- API functions live in `api.ts` only
- Hooks live in `queries.ts` only
- Keys come from `keys.ts`
- No direct `fetch` in components
- Cookies/session rely on `apiClient` (`credentials: 'include'`)
- Mutations invalidate affected query keys
- Forms use `mutateAsync` in submit handlers
- UI handles `ApiClientError` explicitly

## Auth-specific notes
There is also a legacy `src/services/auth.ts` used by service-contractant MFA flows with mocked behaviors.

For consistency with the current auth integration pattern, future refactors should migrate those flows to:
- `src/services/auth/api.ts`
- `src/services/auth/queries.ts`
- React Query mutation/query hooks

This keeps all authentication concerns under one typed, cache-aware integration approach.
