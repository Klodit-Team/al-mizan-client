export type ContractantNotificationCategory =
  | "publication"
  | "attribution"
  | "recours"
  | "systeme"
  | "ia"
  | "depot";

export interface ServiceContractantNotificationItem {
  id: string;
  title: string;
  content: string;
  category: ContractantNotificationCategory;
  sentAt: string;
  isRead: boolean;
}

const API_BASE_URL = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "");
const USE_REAL_API = typeof window !== "undefined" || Boolean(process.env.NEXT_PUBLIC_API_BASE_URL);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let notificationsStore: ServiceContractantNotificationItem[] = [
  {
    id: "SC-NOTIF-001",
    title: "Publication d'avis: AO-2026-041",
    content:
      "L'avis de publication de l'AO-2026-041 a ete genere et diffuse sur la plateforme.",
    category: "publication",
    sentAt: "2026-04-18T08:30:00.000Z",
    isRead: false,
  },
  {
    id: "SC-NOTIF-002",
    title: "Attribution provisoire validee",
    content:
      "La commission a valide l'attribution provisoire pour AO-2026-017. Delai de recours ouvert.",
    category: "attribution",
    sentAt: "2026-04-17T14:20:00.000Z",
    isRead: false,
  },
  {
    id: "SC-NOTIF-003",
    title: "Nouveau recours depose",
    content:
      "Un recours a ete depose par l'operateur Global Network SA sur AO-2026-017.",
    category: "recours",
    sentAt: "2026-04-16T10:12:00.000Z",
    isRead: true,
  },
  {
    id: "SC-NOTIF-004",
    title: "Alerte IA sur evaluation",
    content:
      "L'IA detecte une divergence de notation superieure a 15% dans la phase financiere.",
    category: "ia",
    sentAt: "2026-04-15T17:05:00.000Z",
    isRead: false,
  },
  {
    id: "SC-NOTIF-005",
    title: "Maintenance systeme planifiee",
    content:
      "Une operation de maintenance est prevue dimanche de 01h00 a 03h00.",
    category: "systeme",
    sentAt: "2026-04-14T09:40:00.000Z",
    isRead: true,
  },
];

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

  // Unwrap paginated responses
  if (json && typeof json === "object") {
    if ("data" in json && Array.isArray(json.data)) return json.data as T;
    if ("items" in json && Array.isArray(json.items)) return json.items as T;
    if ("content" in json && Array.isArray(json.content)) return json.content as T;
  }

  return json as T;
}

function cloneNotifications(): ServiceContractantNotificationItem[] {
  return notificationsStore.map((item) => ({ ...item }));
}

export async function listServiceContractantNotifications(): Promise<
  ServiceContractantNotificationItem[]
> {
  if (USE_REAL_API) {
    const raw = await requestJson<any[]>(
      "/api/v1/notifications/mes-notifications",
      { method: "GET" },
    );
    return (Array.isArray(raw) ? raw : []).map((n) => ({
      id: n.id,
      title: n.titre || n.title || "Notification",
      content: n.contenu || n.content || "",
      category: mapNotifCategory(n.categorie || n.category),
      sentAt: n.dateEnvoi || n.date_envoi || n.createdAt || n.created_at || new Date().toISOString(),
      isRead: n.isLue ?? n.is_lue ?? n.isRead ?? false,
    }));
  }

  await sleep(160);
  return cloneNotifications();
}

function mapNotifCategory(cat?: string): ContractantNotificationCategory {
  const c = (cat || "").toUpperCase();
  if (c === "PUBLICATION") return "publication";
  if (c === "ATTRIBUTION") return "attribution";
  if (c === "RECOURS") return "recours";
  if (c === "DEPOT") return "depot";
  if (c.startsWith("IA")) return "ia";
  return "systeme";
}

export async function markServiceContractantNotificationAsRead(
  notificationId: string,
): Promise<ServiceContractantNotificationItem[]> {
  if (USE_REAL_API) {
    return requestJson<ServiceContractantNotificationItem[]>(
      `/api/v1/notifications/${notificationId}/lire`,
      {
        method: "PATCH",
      },
    );
  }

  await sleep(120);
  notificationsStore = notificationsStore.map((item) =>
    item.id === notificationId ? { ...item, isRead: true } : item,
  );
  return cloneNotifications();
}

export async function markAllServiceContractantNotificationsAsRead(): Promise<
  ServiceContractantNotificationItem[]
> {
  if (USE_REAL_API) {
    return requestJson<ServiceContractantNotificationItem[]>(
      "/api/v1/notifications/marquer-toutes-lues",
      {
        method: "PATCH",
      },
    );
  }

  await sleep(140);
  notificationsStore = notificationsStore.map((item) => ({
    ...item,
    isRead: true,
  }));
  return cloneNotifications();
}
