export interface ApiErrorPayload {
  message?: string;
  code?: string;
  [key: string]: unknown;
}

export class ApiClientError extends Error {
  status: number;
  payload: ApiErrorPayload | null;

  constructor(message: string, status: number, payload: ApiErrorPayload | null = null) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.payload = payload;
  }
}

function buildUrl(path: string): string {
  const isServer = typeof window === 'undefined';
  const baseUrl = isServer 
    ? (process.env.INTERNAL_API_URL ?? 'https://api.klodit.app')
    : '';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

async function parseJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return null;
  try { return await response.json(); } catch { return null; }
}

export async function apiClient<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  const isServer = typeof window === 'undefined';
  let cookieHeader = '';
  
  if (isServer) {
    try {
      // Import conditionnel pour éviter de casser les Web components du navigateur
      const nextHeaders = require('next/headers');
      if (nextHeaders && nextHeaders.cookies) {
        const cookieStore = typeof nextHeaders.cookies === 'function' ? nextHeaders.cookies() : null;
        if (cookieStore) {
          // Supporte Next.js 14 (synchrone) et Next.js 15 (asynchrone)
          const resolvedCookies = await Promise.resolve(cookieStore);
          const token = resolvedCookies.get('access_token')?.value;
          if (token) cookieHeader = `access_token=${token}`;
        }
      }
    } catch (e) {
      // Ignorer l'erreur silencieusement si exécuté en dehors du contexte Next
    }
  }

  const isFormDataBody = typeof FormData !== 'undefined' && init?.body instanceof FormData;
  const mergedHeaders: HeadersInit = {
    ...(isFormDataBody ? {} : { 'Content-Type': 'application/json' }),
    ...(cookieHeader ? { 'Cookie': cookieHeader } : {}),
    ...(init?.headers || {}),
  };

  const response = await fetch(buildUrl(path), {
    credentials: 'include',
    headers: mergedHeaders,
    ...init,
  });

  const payload = (await parseJson(response)) as ApiErrorPayload | null;

  if (!response.ok) {
    const message = payload?.message || `Request failed with status ${response.status}`;
    throw new ApiClientError(message, response.status, payload);
  }

  return payload as TResponse;
}