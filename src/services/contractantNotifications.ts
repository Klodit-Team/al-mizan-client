export type ContractantNotificationCategory =
  | "publication"
  | "attribution"
  | "recours"
  | "systeme"
  | "ia";

export interface ServiceContractantNotificationItem {
  id: string;
  title: string;
  content: string;
  category: ContractantNotificationCategory;
  sentAt: string;
  isRead: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

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
  if (!API_BASE_URL) {
    throw new Error("API base URL is not configured");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
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

  return (await response.json()) as T;
}

function cloneNotifications(): ServiceContractantNotificationItem[] {
  return notificationsStore.map((item) => ({ ...item }));
}

export async function listServiceContractantNotifications(): Promise<
  ServiceContractantNotificationItem[]
> {
  if (API_BASE_URL) {
    return requestJson<ServiceContractantNotificationItem[]>(
      "/service-contractant/notifications",
      {
        method: "GET",
      },
    );
  }

  await sleep(160);
  return cloneNotifications();
}

export async function markServiceContractantNotificationAsRead(
  notificationId: string,
): Promise<ServiceContractantNotificationItem[]> {
  if (API_BASE_URL) {
    return requestJson<ServiceContractantNotificationItem[]>(
      `/service-contractant/notifications/${notificationId}/read`,
      {
        method: "POST",
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
  if (API_BASE_URL) {
    return requestJson<ServiceContractantNotificationItem[]>(
      "/service-contractant/notifications/read-all",
      {
        method: "POST",
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
