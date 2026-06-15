export type ProfileLanguage = "fr" | "ar";
export type OrganizationVerificationStatus =
  | "verifie"
  | "en_attente"
  | "non_verifie";

export interface ServiceContractantUserInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredLanguage: ProfileLanguage;
}

export interface ServiceContractantOrganizationInfo {
  denomination: string;
  nif: string;
  nis: string;
  rc: string;
  address: string;
  wilaya: string;
  organizationType: string;
  verificationStatus: OrganizationVerificationStatus;
}

export interface ServiceContractantServiceInfo {
  serviceCode: string;
  activitySector: string;
  ordonnateur: string;
}

export interface ServiceContractantProfile {
  userInfo: ServiceContractantUserInfo;
  organizationInfo: ServiceContractantOrganizationInfo;
  serviceInfo: ServiceContractantServiceInfo;
}

const API_BASE_URL = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "");
const USE_REAL_API = typeof window !== "undefined" || Boolean(process.env.NEXT_PUBLIC_API_BASE_URL);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let profileStore: ServiceContractantProfile = {
  userInfo: {
    firstName: "Nadia",
    lastName: "Bensalem",
    email: "nadia.bensalem@sc-almizan.dz",
    phone: "+213 555 48 22 11",
    preferredLanguage: "fr",
  },
  organizationInfo: {
    denomination: "Direction des Equipements Publics - Alger",
    nif: "001616061234567",
    nis: "001616061234568",
    rc: "16/00-778899A22",
    address: "Rue Hassiba Ben Bouali, Alger Centre",
    wilaya: "Alger",
    organizationType: "Etablissement Public",
    verificationStatus: "verifie",
  },
  serviceInfo: {
    serviceCode: "SC-ALG-DEP-01",
    activitySector: "Infrastructures et equipements publics",
    ordonnateur: "M. Abdelkader Rahmani",
  },
};

function cloneProfile(
  profile: ServiceContractantProfile,
): ServiceContractantProfile {
  return {
    userInfo: { ...profile.userInfo },
    organizationInfo: { ...profile.organizationInfo },
    serviceInfo: { ...profile.serviceInfo },
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

export async function getServiceContractantProfile(): Promise<ServiceContractantProfile> {
  if (USE_REAL_API) {
    return requestJson<ServiceContractantProfile>(
      "/api/v1/users/services-contractants/profile",
      {
        method: "GET",
      },
    );
  }

  await sleep(140);
  return cloneProfile(profileStore);
}

export async function updateServiceContractantProfile(
  payload: ServiceContractantProfile,
): Promise<ServiceContractantProfile> {
  if (USE_REAL_API) {
    return requestJson<ServiceContractantProfile>(
      "/api/v1/users/services-contractants/profile",
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    );
  }

  await sleep(180);
  profileStore = cloneProfile(payload);
  return cloneProfile(profileStore);
}
