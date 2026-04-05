"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Play, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  listServiceContractantTenderEvaluationPhases,
  type TenderEvaluationPhaseOverviewItem,
  type TenderEvaluationPhaseStatus,
} from "@/services/tenderEvaluation";

interface EvaluationOverviewTabProps {
  locale: string;
  aoId: string;
  isRtl: boolean;
}

function getPhaseStatusLabel(status: TenderEvaluationPhaseStatus) {
  switch (status) {
    case "en_cours":
      return "En cours";
    case "terminee":
      return "Terminee";
    case "validee":
      return "Validee";
    default:
      return status;
  }
}

function getPhaseStatusClass(status: TenderEvaluationPhaseStatus) {
  switch (status) {
    case "en_cours":
      return "border-amber-200 bg-amber-100 text-amber-700";
    case "terminee":
      return "border-blue-200 bg-blue-100 text-blue-700";
    case "validee":
      return "border-emerald-200 bg-emerald-100 text-emerald-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

function getActionLabel(status: TenderEvaluationPhaseStatus) {
  if (status === "en_cours") {
    return "Demarrer / voir";
  }

  if (status === "terminee") {
    return "Consulter";
  }

  return "Voir";
}

function formatDateTime(dateValue: string, locale: string) {
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ" : "fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

export default function EvaluationOverviewTab({
  locale,
  aoId,
  isRtl,
}: EvaluationOverviewTabProps) {
  const [phases, setPhases] = useState<TenderEvaluationPhaseOverviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPhases = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await listServiceContractantTenderEvaluationPhases(aoId);
      setPhases(response);
    } catch {
      setError("Impossible de charger les phases d'evaluation.");
    } finally {
      setIsLoading(false);
    }
  }, [aoId]);

  useEffect(() => {
    void loadPhases();
  }, [loadPhases]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
        Chargement des phases d'evaluation...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        <p className="font-semibold text-slate-700">Evaluation overview</p>
        <p className="mt-1">
          Suivi des phases Eligibilite, Technique et Financiere avec acces
          detaille.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {phases.map((phase) => {
          const href = `/${locale}/dashboard/contractant/appels-offres/${aoId}/evaluation/${phase.phase}`;

          return (
            <article
              key={phase.phase}
              className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Phase
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-slate-900">
                    {phase.label}
                  </h3>
                </div>

                <Badge
                  variant="outline"
                  className={cn(
                    "h-6 rounded-full px-2 text-[10px] font-semibold",
                    getPhaseStatusClass(phase.status),
                  )}
                >
                  {getPhaseStatusLabel(phase.status)}
                </Badge>
              </div>

              <p className="mt-2 text-[11px] text-slate-500">
                Derniere mise a jour: {formatDateTime(phase.updatedAt, locale)}
              </p>

              <Link
                href={href}
                className={cn(
                  "mt-3 inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-700 hover:bg-slate-50",
                  isRtl && "flex-row-reverse",
                )}
              >
                {phase.status === "en_cours" ? (
                  <Play className="h-3 w-3" />
                ) : (
                  <Search className="h-3 w-3" />
                )}
                {getActionLabel(phase.status)}
                <ArrowRight className={cn("h-3 w-3", isRtl && "rotate-180")} />
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
