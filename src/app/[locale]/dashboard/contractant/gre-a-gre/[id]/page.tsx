import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";
import {
  getServiceContractantGreAGreRequestById,
  type GreAGreControllerFinalDecision,
  type GreAGreIaRecommendation,
  type GreAGreJustificationType,
} from "@/services/greAGre";
import { cookies } from "next/headers";

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

function getStatusLabel(status: string, dict: any) {
  const statusDict = dict.dashboard.contractant.greAGre.filters;
  switch (status) {
    case "brouillon":
      return statusDict.brouillon;
    case "soumise":
      return statusDict.soumise;
    case "en_analyse_ia":
      return statusDict.en_analyse_ia;
    case "acceptee":
      return statusDict.acceptee;
    case "rejetee":
      return statusDict.rejetee;
    case "en_revision":
      return statusDict.en_revision;
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

function getJustificationTypeLabel(type: GreAGreJustificationType, dict: any) {
  const types = dict.dashboard.contractant.greAGre.form.justificationTypes;
  return types[type] || type;
}

function getIaRecommendationLabel(
  recommendation: GreAGreIaRecommendation,
  dict: any,
) {
  const recs = dict.dashboard.contractant.greAGre.detail.recommendations;
  return recs[recommendation] || recommendation;
}

function getFinalDecisionLabel(
  decision: GreAGreControllerFinalDecision,
  dict: any,
) {
  const recs = dict.dashboard.contractant.greAGre.detail.recommendations;
  return recs[decision] || decision;
}

function formatAmount(amount: string, dict: any) {
  const parsed = Number.parseFloat(amount.replace(/\s/g, ""));
  const currency = dict.dashboard.contractant.greAGre.detail.info.amountCurrency;

  if (Number.isNaN(parsed)) {
    return `${amount} ${currency}`;
  }

  return `${new Intl.NumberFormat("fr-FR").format(parsed)} ${currency}`;
}

export default async function GreAGreRequestDetailPage({
  params,
}: GreAGreRequestDetailPageProps) {
  const { locale, id } = await params;
  const dict = await getDictionary(locale as Locale);
  const detailDict = dict.dashboard.contractant.greAGre.detail;
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const item = await getServiceContractantGreAGreRequestById(id, token);

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
              {detailDict.title}
            </h1>
            <p className="text-xs text-slate-500">
              {detailDict.info.reference}: {item.reference}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {item.status === "en_revision" && (
              <Link
                href={editHref}
                className="inline-flex h-9 items-center rounded-md bg-[#4CAF50] px-3 text-xs font-semibold text-white hover:opacity-95"
              >
                {detailDict.editAndResubmit}
              </Link>
            )}
            <Link
              href={listHref}
              className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {detailDict.backToList}
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {detailDict.info.reference}
            </p>
            <p className="mt-1 text-slate-800">{item.reference}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {detailDict.info.object}
            </p>
            <p className="mt-1 text-slate-800">{item.object}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {detailDict.info.estimatedAmount}
            </p>
            <p className="mt-1 text-slate-800">
              {formatAmount(item.estimatedAmount, dict)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {detailDict.info.submissionDate}
            </p>
            <p className="mt-1 text-slate-800">
              {formatDate(item.submittedAt, locale)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {detailDict.info.iaComplianceScore}
            </p>
            <p className="mt-1 text-slate-800">
              {typeof item.iaComplianceScore === "number"
                ? `${item.iaComplianceScore}/100`
                : detailDict.info.notAnalyzed}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs md:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {detailDict.info.description}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-slate-800">
              {item.description}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs md:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {detailDict.info.status}
            </p>
            <Badge
              variant="outline"
              className={cn(
                "mt-1 h-6 rounded-full px-2 text-[10px] font-semibold",
                getStatusClass(item.status),
              )}
            >
              {getStatusLabel(item.status, dict)}
            </Badge>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <header className="mb-3">
          <h2 className="text-lg font-semibold text-slate-900">
            {detailDict.justifications.title}
          </h2>
          <p className="text-xs text-slate-500">
            {detailDict.justifications.subtitle}
          </p>
        </header>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold text-slate-600">
                <th className="px-3 py-2">
                  {detailDict.justifications.table.order}
                </th>
                <th className="px-3 py-2">
                  {detailDict.justifications.table.type}
                </th>
                <th className="px-3 py-2">
                  {detailDict.justifications.table.description}
                </th>
                <th className="px-3 py-2">
                  {detailDict.justifications.table.file}
                </th>
              </tr>
            </thead>
            <tbody>
              {item.justifications.length === 0 ? (
                <tr>
                  <td
                    className="px-3 py-4 text-center text-xs text-slate-500"
                    colSpan={4}
                  >
                    {detailDict.justifications.noJustifications}
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
                        {getJustificationTypeLabel(justification.type, dict)}
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
            <h2 className="text-lg font-semibold text-slate-900">
              {detailDict.iaAnalysis.title}
            </h2>
            <p className="text-xs text-slate-500">
              {detailDict.iaAnalysis.subtitle}
            </p>
          </header>

          {item.iaAnalysis ? (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {detailDict.iaAnalysis.scoreCompliance}
                  </p>
                  <p className="mt-1 text-slate-800">
                    {item.iaAnalysis.scoreCompliance}/100
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {detailDict.iaAnalysis.confidenceLevel}
                  </p>
                  <p className="mt-1 text-slate-800">
                    {item.iaAnalysis.confidenceLevel}%
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {detailDict.iaAnalysis.recommendation}
                  </p>
                  <p className="mt-1 font-semibold text-[#2F9E44]">
                    {getIaRecommendationLabel(
                      item.iaAnalysis.recommendation,
                      dict,
                    )}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {detailDict.iaAnalysis.justification}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-slate-800">
                  {item.iaAnalysis.justification}
                </p>
              </div>

              <p className="text-[11px] text-slate-500">
                {detailDict.iaAnalysis.analysisDate}:{" "}
                {formatDateTime(item.iaAnalysis.analysisDate, locale)}
              </p>
            </div>
          ) : (
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-500">
              {detailDict.iaAnalysis.noAnalysis}
            </p>
          )}
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <header className="mb-3">
            <h2 className="text-lg font-semibold text-slate-900">
              {detailDict.controller.title}
            </h2>
            <p className="text-xs text-slate-500">
              {detailDict.controller.subtitle}
            </p>
          </header>

          {item.controllerDecision ? (
            <div className="space-y-3 text-xs">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {detailDict.controller.finalDecision}
                </p>
                <p className="mt-1 font-semibold text-slate-800">
                  {getFinalDecisionLabel(
                    item.controllerDecision.finalDecision,
                    dict,
                  )}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {detailDict.controller.reason}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-slate-800">
                  {item.controllerDecision.reason}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {detailDict.controller.matchesIa}
                  </p>
                  <p className="mt-1 text-slate-800">
                    {item.controllerDecision.matchesIaRecommendation
                      ? detailDict.controller.yes
                      : detailDict.controller.no}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {detailDict.controller.decisionDate}
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
              {detailDict.controller.noDecision}
            </p>
          )}
        </article>
      </section>
    </main>
  );
}
