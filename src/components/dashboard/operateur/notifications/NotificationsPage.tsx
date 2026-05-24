"use client";

import { useState, useMemo, useEffect } from "react";
import { Bell, Check, CheckCheck, X, ChevronRight } from "lucide-react";
import {
  MOCK_NOTIFS, CATEGORY_META, CATEGORY_FILTERS, fmtDate,
  type NotifItem, type NotifCategory,
} from "./types";
import { apiClient } from "@/services/client";

// ─── Notification card ─────────────────────────────────────────────────────────

function NotifCard({
  notif, onRead, onDismiss,
}: {
  notif: NotifItem;
  onRead: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const cat = CATEGORY_META[notif.categorie];
  return (
    <li
      onClick={() => onRead(notif.id)}
      className={`group relative cursor-pointer rounded-xl border p-4 transition-all hover:shadow-sm ${
        notif.lu
          ? "border-slate-200 bg-white"
          : "border-[#4CAF50]/25 bg-emerald-50/40"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Unread indicator */}
        <div className="mt-1.5 shrink-0 w-2">
          {!notif.lu && (
            <span className="block h-2 w-2 rounded-full bg-[#4CAF50]" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full px-2 py-px text-[10px] font-semibold ${cat.bg} ${cat.text}`}>
              {cat.label}
            </span>
            <span className="text-[10px] text-slate-400">{fmtDate(notif.dateEnvoi)}</span>
          </div>
          <p className={`text-xs font-semibold ${notif.lu ? "text-slate-700" : "text-slate-900"}`}>
            {notif.titre}
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
            {notif.contenu}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-slate-300 transition-colors group-hover:text-slate-400" />
          <button
            type="button"
            title="Ignorer"
            onClick={(e) => { e.stopPropagation(); onDismiss(notif.id); }}
            className="invisible flex h-6 w-6 items-center justify-center rounded text-slate-300 transition-colors hover:text-slate-500 group-hover:visible"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </li>
  );
}

// ─── Full notification modal ───────────────────────────────────────────────────

function NotifModal({ notif, onClose }: { notif: NotifItem; onClose: () => void }) {
  const cat = CATEGORY_META[notif.categorie];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex-1">
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${cat.bg} ${cat.text}`}>
              {cat.label}
            </span>
            <p className="mt-2 text-base font-bold text-slate-900">{notif.titre}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              {new Date(notif.dateEnvoi).toLocaleDateString("fr-DZ", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm leading-relaxed text-slate-700">{notif.contenu}</p>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [notifs, setNotifs]         = useState<NotifItem[]>([]);
  const [catFilter, setCatFilter]   = useState<NotifCategory | "all">("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [isLoading, setIsLoading]   = useState(true);

  // Fetch real notifications from API
  useEffect(() => {
    apiClient<unknown>(
      "/api/v1/notifications/mes-notifications",
      { method: "GET" },
    )
      .then((response) => {
        // Handle both flat array and paginated { data: [...] } response
        let items: { id: string; titre?: string; title?: string; contenu?: string; content?: string; categorie?: string; type?: string; dateEnvoi?: string; date_envoi?: string; sentAt?: string; lu?: boolean; is_lue?: boolean; isRead?: boolean }[] = [];
        if (Array.isArray(response)) {
          items = response;
        } else if (response && typeof response === "object" && "data" in (response as Record<string, unknown>)) {
          const data = (response as { data: unknown }).data;
          if (Array.isArray(data)) items = data;
        }

        if (items.length > 0) {
          const mapCategorie = (cat: string): NotifCategory => {
            const c = (cat || "").toUpperCase();
            if (c === "PUBLICATION") return "publication_ao";
            if (c === "DEPOT") return "depot_confirme";
            if (c === "OUVERTURE") return "ouverture_plis";
            if (c === "EVALUATION") return "evaluation_resultat";
            if (c === "ATTRIBUTION") return "attribution_provisoire";
            if (c === "RECOURS") return "recours_update";
            if (c.startsWith("IA")) return "systeme";
            return "systeme";
          };

          setNotifs(
            items.map((n) => ({
              id: n.id,
              titre: n.titre || n.title || "Notification",
              contenu: n.contenu || n.content || "",
              categorie: mapCategorie(n.categorie || n.type || "SYSTEME"),
              dateEnvoi: n.dateEnvoi || n.date_envoi || n.sentAt || new Date().toISOString(),
              lu: n.lu ?? n.is_lue ?? n.isRead ?? false,
            })),
          );
        } else {
          setNotifs([]);
        }
      })
      .catch(() => {
        // On API failure, show empty state (not mocks)
        setNotifs([]);
      })
      .finally(() => setIsLoading(false));
  }, []);
  const [selected, setSelected]     = useState<NotifItem | null>(null);

  const unreadCount = useMemo(() => notifs.filter((n) => !n.lu).length, [notifs]);

  const filtered = useMemo(() => notifs.filter((n) => {
    if (unreadOnly && n.lu) return false;
    if (catFilter !== "all" && n.categorie !== catFilter) return false;
    return true;
  }), [notifs, catFilter, unreadOnly]);

  function markRead(id: string) {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, lu: true } : n));
    const notif = notifs.find((n) => n.id === id);
    if (notif) setSelected({ ...notif, lu: true });
    // Call API to mark as read
    apiClient(`/api/v1/notifications/${id}/lire`, { method: "PATCH" }).catch(() => {});
  }

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, lu: true })));
    // Call API to mark all as read
    apiClient("/api/v1/notifications/marquer-toutes-lues", { method: "PATCH" }).catch(() => {});
  }

  function dismiss(id: string) {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <>
      <div className="space-y-4">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <Bell className="h-5 w-5 text-slate-700" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: "#4CAF50" }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Notifications</h1>
              <p className="text-sm text-slate-500">
                {unreadCount > 0
                  ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
                  : "Tout est à jour"}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Tout marquer comme lu
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-3">
            {/* Unread toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUnreadOnly(!unreadOnly)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold transition-colors ${
                  unreadOnly
                    ? "border-[#4CAF50] bg-[#4CAF50] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Check className="h-3 w-3" />
                Non lues seulement
              </button>
              {(catFilter !== "all" || unreadOnly) && (
                <button
                  type="button"
                  onClick={() => { setCatFilter("all"); setUnreadOnly(false); }}
                  className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Réinitialiser
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setCatFilter(f.value)}
                  className={`rounded-full border px-3 py-1 text-[10px] font-semibold transition-colors ${
                    catFilter === f.value
                      ? "border-[#4CAF50] bg-[#4CAF50] text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notification count info */}
        {filtered.length > 0 && (
          <p className="text-xs text-slate-500 px-1">
            {filtered.length} notification{filtered.length !== 1 ? "s" : ""} affichée{filtered.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-20 shadow-sm text-slate-400">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Bell className="h-8 w-8 opacity-30" />
            </div>
            <p className="text-sm font-medium text-slate-500">Aucune notification</p>
            <p className="mt-1 text-xs">
              {unreadOnly ? "Toutes vos notifications ont été lues" : "Vous êtes à jour"}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map((notif) => (
              <NotifCard
                key={notif.id}
                notif={notif}
                onRead={markRead}
                onDismiss={dismiss}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <NotifModal notif={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}