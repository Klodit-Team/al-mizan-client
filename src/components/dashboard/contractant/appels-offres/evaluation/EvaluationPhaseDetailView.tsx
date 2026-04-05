"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  validateServiceContractantTenderEvaluationPhase,
  type ServiceContractantTenderEvaluationPhaseDetail,
  type TenderEvaluationDecision,
  type TenderEvaluationPhaseStatus,
} from "@/services/tenderEvaluation";

interface EvaluationPhaseDetailViewProps {
  locale: string;
  aoId: string;
  initialDetail: ServiceContractantTenderEvaluationPhaseDetail;
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

function getStatusLabel(status: TenderEvaluationPhaseStatus) {
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

function getStatusClass(status: TenderEvaluationPhaseStatus) {
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

function getDecisionLabel(decision: TenderEvaluationDecision) {
  return decision === "retenu" ? "Retenu" : "Elimine";
}

function getDecisionClass(decision: TenderEvaluationDecision) {
  return decision === "retenu"
    ? "border-emerald-200 bg-emerald-100 text-emerald-700"
    : "border-red-200 bg-red-100 text-red-700";
}

export default function EvaluationPhaseDetailView({
  locale,
  aoId,
  initialDetail,
}: EvaluationPhaseDetailViewProps) {
  const [detail, setDetail] =
    useState<ServiceContractantTenderEvaluationPhaseDetail>(initialDetail);
  const [isValidating, setIsValidating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const backHref = `/${locale}/dashboard/contractant/appels-offres/${aoId}?tab=evaluation`;

  const validatePhase = async () => {
    if (!detail.canValidate || isValidating) {
      return;
    }

    setIsValidating(true);
    setActionError(null);

    try {
      const updated = await validateServiceContractantTenderEvaluationPhase(
        aoId,
        detail.phase,
      );
      setDetail(updated);
    } catch {
      setActionError("Impossible de valider cette phase pour le moment.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <main className="space-y-5 overflow-auto p-6">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[11px] text-slate-500">
          Tableau de bord <span className="mx-1">/</span> Appels d'offres{" "}
          <span className="mx-1">/</span> Evaluation phase detail
        </p>

        <header className="mb-4 mt-1 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Evaluation phase detail
            </h1>
            <p className="mt-1 text-sm font-medium text-[#4CAF50]">
              AO {aoId} - Phase {detail.label}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "h-7 rounded-full px-2 text-[10px] font-semibold",
                getStatusClass(detail.status),
              )}
            >
              {getStatusLabel(detail.status)}
            </Badge>

            <Link
              href={backHref}
              className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Retour evaluation
            </Link>
          </div>
        </header>

        {detail.validatedAt && (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            Phase validee le {formatDateTime(detail.validatedAt, locale)}.
          </p>
        )}

        {actionError && (
          <p className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
            {actionError}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <header className="mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Scores table</h2>
        </header>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[860px] border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold text-slate-600">
                <th className="px-3 py-2">Soumission reference</th>
                <th className="px-3 py-2">Score technique</th>
                <th className="px-3 py-2">Score financier</th>
                <th className="px-3 py-2">Score global</th>
                <th className="px-3 py-2">Classement</th>
                <th className="px-3 py-2">Retenu/Elimine</th>
              </tr>
            </thead>
            <tbody>
              {detail.scores.map((row) => (
                <tr
                  key={row.submissionReference}
                  className="border-b border-slate-100 text-xs text-slate-700"
                >
                  <td className="px-3 py-2 font-semibold text-[#2F9E44]">
                    {row.submissionReference}
                  </td>
                  <td className="px-3 py-2">{row.scoreTechnique}</td>
                  <td className="px-3 py-2">{row.scoreFinancier}</td>
                  <td className="px-3 py-2">{row.scoreGlobal}</td>
                  <td className="px-3 py-2">{row.ranking}</td>
                  <td className="px-3 py-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-6 rounded-full px-2 text-[10px] font-semibold",
                        getDecisionClass(row.decision),
                      )}
                    >
                      {getDecisionLabel(row.decision)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <header className="mb-3">
          <h2 className="text-lg font-semibold text-slate-900">
            IA comparison
          </h2>
        </header>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold text-slate-600">
                <th className="px-3 py-2">Soumission reference</th>
                <th className="px-3 py-2">Score commission</th>
                <th className="px-3 py-2">Score IA</th>
                <th className="px-3 py-2">Correspond</th>
                <th className="px-3 py-2">Ecart</th>
                <th className="px-3 py-2">Motif divergence</th>
              </tr>
            </thead>
            <tbody>
              {detail.iaComparisons.map((row) => (
                <tr
                  key={`${row.submissionReference}-ia`}
                  className="border-b border-slate-100 text-xs text-slate-700"
                >
                  <td className="px-3 py-2 font-semibold text-[#2F9E44]">
                    {row.submissionReference}
                  </td>
                  <td className="px-3 py-2">{row.commissionScore}</td>
                  <td className="px-3 py-2">{row.iaScore}</td>
                  <td className="px-3 py-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-6 rounded-full px-2 text-[10px] font-semibold",
                        row.matches
                          ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                          : "border-red-200 bg-red-100 text-red-700",
                      )}
                    >
                      {row.matches ? "Oui" : "Non"}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">{row.deviation}</td>
                  <td className="px-3 py-2">{row.divergenceReason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <header className="mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Rapport</h2>
        </header>

        {detail.report.generated && detail.report.fileUrl ? (
          <a
            href={detail.report.fileUrl}
            className="inline-flex h-9 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            Telecharger {detail.report.fileName || "rapport evaluation"}
          </a>
        ) : (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Rapport d'evaluation indisponible (generation en attente).
          </p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <header className="mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Actions</h2>
        </header>

        <button
          type="button"
          onClick={() => {
            void validatePhase();
          }}
          disabled={!detail.canValidate || isValidating}
          className="inline-flex h-9 items-center gap-1 rounded-md bg-[#4CAF50] px-3 text-xs font-semibold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Check className="h-3.5 w-3.5" />
          {isValidating ? "Validation..." : "Valider la phase"}
        </button>
      </section>
    </main>
  );
}
