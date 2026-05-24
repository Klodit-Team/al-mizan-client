export interface ServiceContractantSessionItem {
  id: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  isCurrent: boolean;
}

export interface ServiceContractantSecurityOverview {
  mfaEnabled: boolean;
  sessions: ServiceContractantSessionItem[];
}

export interface MfaSetupData {
  manualKey: string;
}

const API_BASE_URL = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "");
const USE_REAL_API = typeof window !== "undefined" || Boolean(process.env.NEXT_PUBLIC_API_BASE_URL);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let mfaEnabledStore = true;
let sessionsStore: ServiceContractantSessionItem[] = [
  {
    id: "sc-sess-001",
    ip: "105.104.12.78",
    userAgent: "Chrome 135 - Windows 11",
    createdAt: "2026-04-16T09:11:00.000Z",
    isCurrent: true,
  },
  {
    id: "sc-sess-002",
    ip: "41.111.203.55",
    userAgent: "Safari 18 - iPhone iOS 18",
    createdAt: "2026-04-14T18:45:00.000Z",
    isCurrent: false,
  },
  {
    id: "sc-sess-003",
    ip: "41.96.41.12",
    userAgent: "Firefox 137 - Ubuntu 24.04",
    createdAt: "2026-04-12T07:23:00.000Z",
    isCurrent: false,
  },
];

function cloneOverview(): ServiceContractantSecurityOverview {
  return {
    mfaEnabled: mfaEnabledStore,
    sessions: sessionsStore.map((item) => ({ ...item })),
  };
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;

  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  const json = await response.json();

  // Unwrap paginated responses { data: [...] }
  if (json && typeof json === "object" && "data" in json && Array.isArray(json.data)) {
    return json.data as T;
  }

  return json as T;
}

export async function getServiceContractantSecurityOverview(): Promise<ServiceContractantSecurityOverview> {
  if (USE_REAL_API) {
    return requestJson<ServiceContractantSecurityOverview>(
      "/api/v1/auth/sessions",
      {
        method: "GET",
      },
    );
  }

  await sleep(140);
  return cloneOverview();
}

export async function startServiceContractantMfaSetup(): Promise<MfaSetupData> {
  if (USE_REAL_API) {
    return requestJson<MfaSetupData>(
      "/api/v1/auth/mfa/setup",
      {
        method: "POST",
      },
    );
  }

  await sleep(200);
  return { manualKey: "JBSWY3DPEHPK3PXP" };
}

export async function confirmServiceContractantMfaSetup(): Promise<ServiceContractantSecurityOverview> {
  if (USE_REAL_API) {
    return requestJson<ServiceContractantSecurityOverview>(
      "/api/v1/auth/mfa/confirm",
      {
        method: "POST",
      },
    );
  }

  await sleep(200);
  mfaEnabledStore = true;
  return cloneOverview();
}

export async function disableServiceContractantMfa(
  password: string,
): Promise<ServiceContractantSecurityOverview> {
  if (USE_REAL_API) {
    return requestJson<ServiceContractantSecurityOverview>(
      "/api/v1/auth/mfa/disable",
      {
        method: "POST",
        body: JSON.stringify({ password }),
      },
    );
  }

  await sleep(220);

  if (!password.trim()) {
    throw new Error("Mot de passe requis");
  }

  mfaEnabledStore = false;
  return cloneOverview();
}

export async function revokeServiceContractantSession(
  sessionId: string,
): Promise<ServiceContractantSecurityOverview> {
  if (USE_REAL_API) {
    return requestJson<ServiceContractantSecurityOverview>(
      `/api/v1/auth/sessions/${sessionId}`,
      {
        method: "DELETE",
      },
    );
  }

  await sleep(160);
  sessionsStore = sessionsStore.filter((item) => item.id !== sessionId);
  return cloneOverview();
}

export async function revokeAllOtherServiceContractantSessions(): Promise<ServiceContractantSecurityOverview> {
  if (USE_REAL_API) {
    return requestJson<ServiceContractantSecurityOverview>(
      "/api/v1/auth/logout-all",
      {
        method: "POST",
      },
    );
  }

  await sleep(170);
  sessionsStore = sessionsStore.filter((item) => item.isCurrent);
  return cloneOverview();
}
