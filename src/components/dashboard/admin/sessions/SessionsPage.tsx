"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { getDictionary } from "@/i18n/get-dictionaries";
import {
  listActiveSessions,
  revokeSession,
  type ActiveSession,
} from "@/services/admin/sessions";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

interface SessionsPageProps {
  locale: string;
  dict: CommonDict["dashboard"]["admin"]["sessionsPage"];
}

const FALLBACK_SESSIONS: ActiveSession[] = [
  {
    id: "session-001",
    userId: "admin-demo",
    ip: "196.20.12.45",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "session-002",
    userId: "controleur-01",
    ip: "41.110.8.73",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "session-003",
    userId: "service-contractant-12",
    ip: "102.39.144.18",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/122.0",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
  },
];

export default function SessionsPage({ locale, dict }: SessionsPageProps) {
  const labels = useMemo(() => {
    const extra = dict as typeof dict & {
      columns?: { actions?: string };
      actions?: {
        revoke?: string;
        revoking?: string;
        confirmRevoke?: string;
        revokeError?: string;
      };
      loading?: string;
      error?: string;
      success?: string;
      unknown?: string;
      notAvailable?: string;
    };

    return {
      actionsColumn: extra.columns?.actions ?? "Actions",
      revoke: extra.actions?.revoke ?? "Révoquer",
      revoking: extra.actions?.revoking ?? "Révocation...",
      confirmRevoke: extra.actions?.confirmRevoke ?? "Révoquer la session depuis l'adresse IP {{ip}} ?",
      revokeError: extra.actions?.revokeError ?? "Impossible de révoquer la session.",
      loading: extra.loading ?? "Chargement des sessions...",
      error: extra.error ?? "Impossible de charger les sessions.",
      success: extra.success ?? "Session révoquée avec succès.",
      unknown: extra.unknown ?? "Inconnu",
      notAvailable: extra.notAvailable ?? "N/A",
    };
  }, [dict]);

  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await listActiveSessions();
      setSessions(Array.isArray(data) ? data : [FALLBACK_SESSIONS[0]]);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError(labels.error);
      setSessions(FALLBACK_SESSIONS);
    } finally {
      setIsLoading(false);
    }
  }, [labels.error]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevoke = async (session: ActiveSession) => {
    const confirmed = window.confirm(labels.confirmRevoke.replace("{{ip}}", session.ip));
    if (!confirmed) return;

    const previous = sessions;
    setRevokingId(session.id);
    setSessions((current) => current.filter((item) => item.id !== session.id));

    try {
      await revokeSession(session.id);
      setSuccessMessage(labels.success);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error revoking session:", err);
      setSessions(previous);
      setError(labels.revokeError);
    } finally {
      setRevokingId(null);
    }
  };

  const filtered = sessions.filter((session) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    return [session.id, session.userId, session.ip, session.userAgent].some((value) =>
      value.toLowerCase().includes(query),
    );
  });

  const getDeviceName = (userAgent: string): string => {
    if (userAgent.includes("iPhone")) return "iPhone";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("Windows")) return "Windows";
    if (userAgent.includes("Mac")) return "macOS";
    if (userAgent.includes("Linux")) return "Linux";
    return labels.unknown;
  };

  const getBrowserName = (userAgent: string): string => {
    if (userAgent.includes("Edg") || userAgent.includes("Edge")) return "Edge";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Safari")) return "Safari";
    return labels.unknown;
  };

  const isRecentActivity = (lastActivity: string): boolean => {
    const timestamp = new Date(lastActivity).getTime();
    if (Number.isNaN(timestamp)) return false;

    return Date.now() - timestamp < 5 * 60 * 1000;
  };

  const formatDateTime = (value: string): string => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return labels.notAvailable;

    return date.toLocaleString(locale === "ar" ? "ar-DZ" : "fr-DZ", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{dict.title}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{dict.subtitle}</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          placeholder={dict.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-green-100 focus:border-[#4CAF50] bg-white text-gray-700"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{dict.columns.user}</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{dict.columns.ip}</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{dict.columns.userAgent}</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{dict.columns.connected}</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{dict.columns.lastActivity}</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{labels.actionsColumn}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-gray-500">
                    {labels.loading}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-gray-500">
                    {dict.noSessions}
                  </td>
                </tr>
              ) : (
                filtered.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-800">{session.userId}</p>
                    </td>
                    <td className="px-5 py-4">
                      <code className="text-xs font-mono bg-gray-50 text-gray-700 px-2 py-1 rounded">{session.ip}</code>
                    </td>
                    <td className="px-5 py-4">
                      <div className="max-w-[360px] space-y-2">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                            {getDeviceName(session.userAgent)}
                          </span>
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                            {getBrowserName(session.userAgent)}
                          </span>
                        </div>
                        <p className="break-words font-mono text-xs leading-relaxed text-gray-500">
                          {session.userAgent}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {formatDateTime(session.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {isRecentActivity(session.lastActivity) && (
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                        )}
                        <span className="text-sm text-gray-600">
                          {formatDateTime(session.lastActivity)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleRevoke(session)}
                          disabled={revokingId === session.id}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-red-500 border border-red-600 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {revokingId === session.id ? labels.revoking : labels.revoke}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
