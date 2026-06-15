"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Loader2, ShieldAlert } from "lucide-react";
import { getAnomaliesParAo, type AnomaliesParAo } from "@/services/soumission-anomalies";

const ANOMALY_TYPE_LABELS: Record<string, string> = {
  COLLUSION: "Collusion",
  PRICE_PATTERN: "Patterns de prix",
  SAUCISSONNAGE: "Saucissonnage",
};

interface AnomalyDetectionCardProps {
  aoId: string;
  locale: string;
}

export default function AnomalyDetectionCard({ aoId }: AnomalyDetectionCardProps) {
  const [data, setData] = useState<AnomaliesParAo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    getAnomaliesParAo(aoId)
      .then((result) => {
        if (active) setData(result);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [aoId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
        <div className="flex items-center gap-2 text-sm text-purple-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="font-semibold">Détection d&apos;anomalies en cours…</span>
        </div>
        <p className="mt-1 text-[11px] text-purple-500">
          L&apos;agent IA analyse les soumissions pour détecter des patterns suspects.
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
        <div className="flex items-center gap-2 text-sm text-purple-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="font-semibold">Détection d&apos;anomalies en cours…</span>
        </div>
        <p className="mt-1 text-[11px] text-purple-500">
          L&apos;agent IA analyse les soumissions pour détecter des patterns suspects.
        </p>
      </div>
    );
  }

  const hasAnomalies = data.totalAnomalies > 0;
  const anomalyTypes = ["COLLUSION", "PRICE_PATTERN", "SAUCISSONNAGE"];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-purple-500" />
        <h3 className="text-sm font-semibold text-slate-900">Analyse d&apos;anomalies IA</h3>
        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
          IA
        </span>
      </div>

      <div
        className={`mb-4 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold ${
          hasAnomalies
            ? "bg-orange-50 text-orange-700 border border-orange-200"
            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
        }`}
      >
        {hasAnomalies ? (
          <AlertTriangle className="h-4 w-4 shrink-0" />
        ) : (
          <CheckCircle className="h-4 w-4 shrink-0" />
        )}
        {hasAnomalies
          ? `${data.totalAnomalies} anomalie(s) détectée(s)`
          : "Aucune anomalie détectée"}
      </div>

      <div className="mb-4 space-y-2">
        {anomalyTypes.map((type) => {
          const count = data.breakdown[type] ?? 0;
          return (
            <div
              key={type}
              className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-xs"
            >
              <span className="text-slate-700">{ANOMALY_TYPE_LABELS[type] ?? type}</span>
              <span
                className={`font-semibold ${
                  count > 0 ? "text-orange-600" : "text-slate-400"
                }`}
              >
                {count > 0 ? `${count} cas` : "Aucun"}
              </span>
            </div>
          );
        })}
      </div>

      {data.flaggedBids.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Soumissions signalées
          </p>
          <div className="space-y-2">
            {data.flaggedBids.map((bid) => (
              <div
                key={`${bid.soumissionId}-${bid.anomalyType}`}
                className="rounded-lg border border-orange-100 bg-orange-50 p-2.5 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-orange-700">
                      {ANOMALY_TYPE_LABELS[bid.anomalyType] ?? bid.anomalyType}
                    </span>
                    <p className="mt-0.5 text-slate-600">{bid.detail}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-orange-200 px-2 py-0.5 text-[10px] font-semibold text-orange-800">
                    {Math.round(bid.confidence * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
