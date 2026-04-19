import Link from "next/link";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getServiceContractantTenderRecoursById,
  type TenderRecoursDecision,
  type TenderRecoursStatus,
} from "@/services/tenderRecours";

interface TenderRecoursDetailPageProps {
  params: Promise<{ locale: string; id: string; recoursId: string }>;
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

function getStatusLabel(status: TenderRecoursStatus) {
  switch (status) {
    case "depose":
      return "Depose";
    case "en_examen":
      return "En examen";
    case "accepte":
      return "Accepte";
    case "rejete":
      return "Rejete";
    default:
      return status;
  }
}

function getStatusClass(status: TenderRecoursStatus) {
  switch (status) {
    case "depose":
      return "border-blue-200 bg-blue-100 text-blue-700";
    case "en_examen":
      return "border-amber-200 bg-amber-100 text-amber-700";
    case "accepte":
      return "border-emerald-200 bg-emerald-100 text-emerald-700";
    case "rejete":
      return "border-red-200 bg-red-100 text-red-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

function getDecisionLabel(decision: TenderRecoursDecision) {
  return decision === "accepte" ? "Accepte" : "Rejete";
}

function getDecisionClass(decision: TenderRecoursDecision) {
  return decision === "accepte"
    ? "border-emerald-200 bg-emerald-100 text-emerald-700"
    : "border-red-200 bg-red-100 text-red-700";
}

export default async function TenderRecoursDetailPage({
  params,
}: TenderRecoursDetailPageProps) {
  const { locale, id, recoursId } = await params;

  const recours = await getServiceContractantTenderRecoursById(id, recoursId);

  if (!recours) {
    notFound();
  }

  const backHref = `/${locale}/dashboard/contractant/appels-offres/${id}?tab=recours`;

  return (
    <main className="space-y-5 overflow-auto p-6">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[11px] text-slate-500">
          Tableau de bord <span className="mx-1">/</span> Appels d'offres{" "}
          <span className="mx-1">/</span> Detail recours
        </p>

        <header className="mb-4 mt-1 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Detail recours
            </h1>
            <p className="mt-1 text-sm font-medium text-[#4CAF50]">
              AO {id} - {recours.reference}
            </p>
          </div>

          <Link
            href={backHref}
            className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Retour a la liste des recours
          </Link>
        </header>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Reference
            </p>
            <p className="mt-1 font-semibold text-slate-800">
              {recours.reference}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Operateur
            </p>
            <p className="mt-1 text-slate-800">{recours.operatorName}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Date depot
            </p>
            <p className="mt-1 text-slate-800">
              {formatDate(recours.submittedAt, locale)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Date limite reponse
            </p>
            <p className="mt-1 text-slate-800">
              {formatDate(recours.responseDeadlineAt, locale)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs md:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Motif
            </p>
            <p className="mt-1 whitespace-pre-wrap text-slate-800">
              {recours.reason}
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
                getStatusClass(recours.status),
              )}
            >
              {getStatusLabel(recours.status)}
            </Badge>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <header className="mb-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Pieces jointes
          </h2>
        </header>

        {recours.attachments.length > 0 ? (
          <div className="space-y-2">
            {recours.attachments.map((file) => (
              <a
                key={file.id}
                href={file.fileUrl}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5" />
                {file.fileName}
              </a>
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Aucune piece jointe.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <header className="mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Decision</h2>
        </header>

        {recours.decision ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Decision
              </p>
              <Badge
                variant="outline"
                className={cn(
                  "mt-1 h-6 rounded-full px-2 text-[10px] font-semibold",
                  getDecisionClass(recours.decision),
                )}
              >
                {getDecisionLabel(recours.decision)}
              </Badge>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Date decision
              </p>
              <p className="mt-1 text-slate-800">
                {recours.decisionDate
                  ? formatDate(recours.decisionDate, locale)
                  : "-"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs md:col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Motif decision
              </p>
              <p className="mt-1 whitespace-pre-wrap text-slate-800">
                {recours.decisionReason || "-"}
              </p>
            </div>
          </div>
        ) : (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Decision non encore disponible.
          </p>
        )}

        <p className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          SC peut consulter ce recours. Son traitement est effectue par la
          Commission/Controleur.
        </p>
      </section>
    </main>
  );
}
