import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getServiceContractantGreAGreRequestById,
  type GreAGreControllerFinalDecision,
  type GreAGreIaRecommendation,
  type GreAGreJustificationType,
} from "@/services/greAGre";

interface GreAGreRequestDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

function formatDate(dateValue: string, locale: string) {
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ" : "fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
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

function getStatusLabel(status: string) {
  switch (status) {
    case "brouillon":
      return "Brouillon";
    case "soumise":
      return "Soumise";
    case "en_analyse_ia":
      return "En analyse IA";
    case "acceptee":
      return "Acceptee";
    case "rejetee":
      return "Rejetee";
    case "en_revision":
      return "En revision";
    default:
      return status;
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case "brouillon":
      return "border-slate-200 bg-slate-100 text-slate-700";
    case "soumise":
      return "border-blue-200 bg-blue-100 text-blue-700";
    case "en_analyse_ia":
      return "border-purple-200 bg-purple-100 text-purple-700";
    case "acceptee":
      return "border-emerald-200 bg-emerald-100 text-emerald-700";
    case "rejetee":
      return "border-red-200 bg-red-100 text-red-700";
    case "en_revision":
      return "border-amber-200 bg-amber-100 text-amber-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

function getJustificationTypeLabel(type: GreAGreJustificationType) {
  switch (type) {
    case "urgence":
      return "Urgence";
    case "technique":
      return "Technique";
    case "economique":
      return "Economique";
    case "juridique":
      return "Juridique";
    case "autre":
      return "Autre";
    default:
      return type;
  }
}

function getIaRecommendationLabel(recommendation: GreAGreIaRecommendation) {
  switch (recommendation) {
    case "accepter":
      return "Accepter";
    case "rejeter":
      return "Rejeter";
    case "demander_complements":
      return "Demander des complements";
    default:
      return recommendation;
  }
}

function getFinalDecisionLabel(decision: GreAGreControllerFinalDecision) {
  switch (decision) {
    case "accepter":
      return "Accepter";
    case "rejeter":
      return "Rejeter";
    case "demander_complements":
      return "Demander des complements";
    default:
      return decision;
  }
}

function formatAmount(amount: string) {
  const parsed = Number.parseFloat(amount.replace(/\s/g, ""));
  if (Number.isNaN(parsed)) {
    return `${amount} DZD`;
  }

  return `${new Intl.NumberFormat("fr-FR").format(parsed)} DZD`;
}

export default async function GreAGreRequestDetailPage({
  params,
}: GreAGreRequestDetailPageProps) {
  const { locale, id } = await params;
  const item = await getServiceContractantGreAGreRequestById(id);

  if (!item) {
    notFound();
  }

  const listHref = `/${locale}/dashboard/contractant/gre-a-gre`;
  const editHref = `/${locale}/dashboard/contractant/gre-a-gre/${item.id}/edit`;

  return (
    <main className="space-y-5 overflow-auto p-6">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <header className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Detail demande Gre a Gre
            </h1>
            <p className="text-xs text-slate-500">
              Reference: {item.reference}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {item.status === "en_revision" && (
              <Link
                href={editHref}
                className="inline-flex h-9 items-center rounded-md bg-[#4CAF50] px-3 text-xs font-semibold text-white hover:opacity-95"
              >
                Modifier et resoumettre
              </Link>
            )}
            <Link
              href={listHref}
              className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Retour a la liste
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Reference
            </p>
            <p className="mt-1 text-slate-800">{item.reference}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Objet
            </p>
            <p className="mt-1 text-slate-800">{item.object}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Montant estime
            </p>
            <p className="mt-1 text-slate-800">
              {formatAmount(item.estimatedAmount)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Date soumission
            </p>
            <p className="mt-1 text-slate-800">
              {formatDate(item.submittedAt, locale)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Score conformite IA
            </p>
            <p className="mt-1 text-slate-800">
              {typeof item.iaComplianceScore === "number"
                ? `${item.iaComplianceScore}/100`
                : "Non analyse"}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs md:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Description
            </p>
            <p className="mt-1 whitespace-pre-wrap text-slate-800">
              {item.description}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs md:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Statut
            </p>
            <Badge
              variant="outline"
              className={cn(
                "mt-1 h-6 rounded-full px-2 text-[10px] font-semibold",
                getStatusClass(item.status),
              )}
            >
              {getStatusLabel(item.status)}
            </Badge>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <header className="mb-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Justifications
          </h2>
          <p className="text-xs text-slate-500">
            Justifications fournies avec les fichiers annexes.
          </p>
        </header>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold text-slate-600">
                <th className="px-3 py-2">Ordre</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Fichier</th>
              </tr>
            </thead>
            <tbody>
              {item.justifications.length === 0 ? (
                <tr>
                  <td
                    className="px-3 py-4 text-center text-xs text-slate-500"
                    colSpan={4}
                  >
                    Aucune justification disponible.
                  </td>
                </tr>
              ) : (
                item.justifications
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((justification) => (
                    <tr
                      key={`${justification.type}-${justification.order}-${justification.description}`}
                      className="border-b border-slate-100 text-xs text-slate-700"
                    >
                      <td className="px-3 py-2">{justification.order}</td>
                      <td className="px-3 py-2 font-semibold text-[#2F9E44]">
                        {getJustificationTypeLabel(justification.type)}
                      </td>
                      <td className="px-3 py-2">{justification.description}</td>
                      <td className="px-3 py-2">
                        {justification.fileName || "-"}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <header className="mb-3">
            <h2 className="text-lg font-semibold text-slate-900">Analyse IA</h2>
            <p className="text-xs text-slate-500">
              Evaluation automatique de conformite et recommandation.
            </p>
          </header>

          {item.iaAnalysis ? (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Score conformite
                  </p>
                  <p className="mt-1 text-slate-800">
                    {item.iaAnalysis.scoreCompliance}/100
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Niveau de confiance
                  </p>
                  <p className="mt-1 text-slate-800">
                    {item.iaAnalysis.confidenceLevel}%
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Recommandation IA
                  </p>
                  <p className="mt-1 font-semibold text-[#2F9E44]">
                    {getIaRecommendationLabel(item.iaAnalysis.recommendation)}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Justification IA
                </p>
                <p className="mt-1 whitespace-pre-wrap text-slate-800">
                  {item.iaAnalysis.justification}
                </p>
              </div>

              <p className="text-[11px] text-slate-500">
                Date analyse:{" "}
                {formatDateTime(item.iaAnalysis.analysisDate, locale)}
              </p>
            </div>
          ) : (
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-500">
              Aucune analyse IA disponible pour cette demande.
            </p>
          )}
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <header className="mb-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Decision controleur
            </h2>
            <p className="text-xs text-slate-500">
              Decision finale et alignement avec la recommandation IA.
            </p>
          </header>

          {item.controllerDecision ? (
            <div className="space-y-3 text-xs">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Decision finale
                </p>
                <p className="mt-1 font-semibold text-slate-800">
                  {getFinalDecisionLabel(item.controllerDecision.finalDecision)}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Motif
                </p>
                <p className="mt-1 whitespace-pre-wrap text-slate-800">
                  {item.controllerDecision.reason}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Correspond a la recommandation IA
                  </p>
                  <p className="mt-1 text-slate-800">
                    {item.controllerDecision.matchesIaRecommendation
                      ? "Oui"
                      : "Non"}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Date decision
                  </p>
                  <p className="mt-1 text-slate-800">
                    {formatDateTime(
                      item.controllerDecision.decisionDate,
                      locale,
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-500">
              Aucune decision controleur disponible pour cette demande.
            </p>
          )}
        </article>
      </section>
    </main>
  );
}
