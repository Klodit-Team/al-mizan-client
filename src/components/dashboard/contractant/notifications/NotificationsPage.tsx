"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";

import {
  listServiceContractantNotifications,
  markAllServiceContractantNotificationsAsRead,
  markServiceContractantNotificationAsRead,
  type ContractantNotificationCategory,
  type ServiceContractantNotificationItem,
} from "@/services/contractantNotifications";

const CATEGORY_LABELS: Record<ContractantNotificationCategory, string> = {
  publication: "Publication",
  attribution: "Attribution",
  recours: "Recours",
  systeme: "Systeme",
  ia: "IA",
};

const CATEGORY_STYLES: Record<
  ContractantNotificationCategory,
  { bg: string; text: string }
> = {
  publication: { bg: "bg-sky-100", text: "text-sky-700" },
  attribution: { bg: "bg-emerald-100", text: "text-emerald-700" },
  recours: { bg: "bg-rose-100", text: "text-rose-700" },
  systeme: { bg: "bg-slate-100", text: "text-slate-600" },
  ia: { bg: "bg-violet-100", text: "text-violet-700" },
};

function formatDate(value: string, locale: string) {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ" : "fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

export default function NotificationsPage({ locale }: { locale: string }) {
  const [items, setItems] = useState<ServiceContractantNotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [category, setCategory] = useState<
    "all" | ContractantNotificationCategory
  >("all");

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await listServiceContractantNotifications();
      setItems(response);
    } catch {
      setError("Impossible de charger les notifications.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.isRead).length,
    [items],
  );

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        if (unreadOnly && item.isRead) {
          return false;
        }

        if (category !== "all" && item.category !== category) {
          return false;
        }

        return true;
      }),
    [items, unreadOnly, category],
  );

  const markOneAsRead = async (id: string) => {
    setIsBusy(true);
    setError(null);

    try {
      const updated = await markServiceContractantNotificationAsRead(id);
      setItems(updated);
    } catch {
      setError("Impossible de marquer cette notification comme lue.");
    } finally {
      setIsBusy(false);
    }
  };

  const markAllAsRead = async () => {
    setIsBusy(true);
    setError(null);

    try {
      const updated = await markAllServiceContractantNotificationsAsRead();
      setItems(updated);
    } catch {
      setError("Impossible de marquer toutes les notifications comme lues.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <header className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <Bell className="h-5 w-5 text-slate-700" />
              {unreadCount > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                  style={{ backgroundColor: "#4CAF50" }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Notifications
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isBusy || unreadCount === 0}
            onClick={markAllAsRead}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all as read
          </button>
        </div>
      </header>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setUnreadOnly((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold transition-colors ${
              unreadOnly
                ? "border-[#4CAF50] bg-[#4CAF50] text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Check className="h-3 w-3" />
            Unread only
          </button>

          {(
            [
              "all",
              "publication",
              "attribution",
              "recours",
              "systeme",
              "ia",
            ] as const
          ).map((value) => {
            const isActive = category === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                className={`rounded-full border px-3 py-1 text-[10px] font-semibold transition-colors ${
                  isActive
                    ? "border-[#4CAF50] bg-[#4CAF50] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {value === "all" ? "Toutes" : CATEGORY_LABELS[value]}
              </button>
            );
          })}
        </div>
      </section>

      {isLoading ? (
        <div className="space-y-2">
          <div className="h-20 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-20 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-20 animate-pulse rounded-xl bg-gray-200" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 shadow-sm">
          Aucune notification pour les filtres selectionnes.
        </div>
      ) : (
        <ul className="space-y-2">
          {filteredItems.map((item) => {
            const style = CATEGORY_STYLES[item.category];
            return (
              <li
                key={item.id}
                className={`rounded-xl border p-4 shadow-sm ${
                  item.isRead
                    ? "border-slate-200 bg-white"
                    : "border-emerald-200 bg-emerald-50/40"
                }`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-px text-[10px] font-semibold ${style.bg} ${style.text}`}
                      >
                        {CATEGORY_LABELS[item.category]}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatDate(item.sentAt, locale)}
                      </span>
                      <span
                        className={`inline-flex rounded-full border px-2 py-px text-[10px] font-semibold ${
                          item.isRead
                            ? "border-slate-200 bg-slate-100 text-slate-600"
                            : "border-emerald-200 bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {item.isRead ? "Read" : "Unread"}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      {item.content}
                    </p>
                  </div>

                  {!item.isRead && (
                    <button
                      type="button"
                      onClick={() => markOneAsRead(item.id)}
                      disabled={isBusy}
                      className="inline-flex h-7 items-center rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
