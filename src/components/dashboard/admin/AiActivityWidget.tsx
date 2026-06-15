"use client";
import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { apiClient } from "@/services/client";

interface AgentExecution {
  id: string;
  agentName: string;
  entite: string;
  entite_id: string;
  statut: "SUCCES" | "ALERTE" | "ERREUR" | string;
  horodatage: string;
}

const AGENT_LABELS: Record<string, string> = {
  ocr_nlp_agent: "Agent OCR/NLP",
  anomaly_agent: "Agent Anomalies",
  evaluation_agent: "Agent Évaluation",
  genai_cdc_agent: "Agent CDC IA",
  gre_a_gre_agent: "Agent Gré-à-Gré",
};

const STATUS_STYLES: Record<string, { dot: string; badge: string; label: string }> = {
  SUCCES:  { dot: "bg-green-500",  badge: "bg-green-50 text-green-700",  label: "Succès"  },
  ALERTE:  { dot: "bg-yellow-500", badge: "bg-yellow-50 text-yellow-700", label: "Alerte"  },
  ERREUR:  { dot: "bg-red-500",    badge: "bg-red-50 text-red-700",       label: "Erreur"  },
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  return `il y a ${Math.floor(h / 24)}j`;
}

interface Props {
  locale: Locale;
  auditLogsPath: string;
}

export default function AiActivityWidget({ locale, auditLogsPath }: Props) {
  const [executions, setExecutions] = useState<AgentExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await apiClient<unknown>("/api/v1/audit/logs?agentName=all&limit=5", { method: "GET" }).catch(() => null);
        const payload = (raw as any)?.data ?? raw;
        const arr: AgentExecution[] = (Array.isArray(payload) ? payload : (payload as any)?.data ?? [])
          .filter((l: any) => Boolean(l.agentName))
          .slice(0, 5);
        setExecutions(arr);
      } catch {
        setExecutions([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "#1e2535", borderColor: "#2a3347" }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "#2a3347" }}>
        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
        </svg>
        <span className="text-sm font-bold text-white tracking-wide">Activité des agents IA</span>
      </div>

      <div className="p-3 space-y-2">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 px-2 py-2">
              <div className="w-2 h-2 rounded-full bg-gray-700 shrink-0" />
              <div style={{ flex: 1 }}>
                <div className="h-3 bg-gray-700 rounded mb-1.5" style={{ width: "55%" }} />
                <div className="h-2.5 bg-gray-700 rounded" style={{ width: "70%" }} />
              </div>
              <div className="h-5 w-14 bg-gray-700 rounded-full" />
            </div>
          ))
        ) : executions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 gap-2">
            <svg className="w-8 h-8 opacity-30 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
            </svg>
            <p className="text-xs text-gray-500">Aucune exécution d'agent récente</p>
          </div>
        ) : (
          executions.map((exec) => {
            const s = STATUS_STYLES[exec.statut] ?? STATUS_STYLES.ALERTE;
            const label = AGENT_LABELS[exec.agentName] ?? exec.agentName;
            return (
              <a
                key={exec.id}
                href={`/${locale}${auditLogsPath}?logId=${exec.id}`}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors no-underline"
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="text-xs font-semibold text-white truncate">{label}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {exec.entite} / <span className="font-mono">{exec.entite_id?.slice(0, 10)}…</span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.badge}`}>{s.label}</span>
                  <span className="text-[10px] text-gray-500">{relativeTime(exec.horodatage)}</span>
                </div>
              </a>
            );
          })
        )}

        {/* Footer link */}
        <div className="pt-1 border-t" style={{ borderColor: "#2a3347" }}>
          <a
            href={`/${locale}${auditLogsPath}?action=AI`}
            className="text-xs font-semibold text-green-400 hover:text-green-300 transition-colors"
          >
            Voir tous les logs IA →
          </a>
        </div>
      </div>
    </div>
  );
}
