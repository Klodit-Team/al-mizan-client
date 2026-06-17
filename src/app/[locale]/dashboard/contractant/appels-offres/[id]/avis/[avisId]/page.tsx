import { notFound } from "next/navigation";

import AvisDetailActions from "@/components/dashboard/contractant/appels-offres/avis/AvisDetailActions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getServiceContractantTenderAvisById,
  type TenderAvisType,
  type TenderAvisSupport,
} from "@/services/tendersAvis";

interface TenderAvisDetailPageProps {
  params: Promise<{ locale: string; id: string; avisId: string }>;
}

function getTypeLabel(type: TenderAvisType) {
  switch (type) {
    case "ao":
      return "AO";
    case "attribution_provisoire":
      return "Attribution provisoire";
    case "attribution_definitive":
      return "Attribution definitive";
    case "annulation":
      return "Annulation";
    case "rectificatif":
      return "Rectificatif";
    default:
      return type;
  }
}

function getSupportLabel(support: TenderAvisSupport) {
  switch (support) {
    case "bomop":
      return "BOMOP";
    case "presse":
      return "Presse";
    case "plateforme":
      return "Plateforme";
    default:
      return support;
  }
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

export default async function TenderAvisDetailPage({
  params,
}: TenderAvisDetailPageProps) {
  const { locale, id, avisId } = await params;
  const avis = await getServiceContractantTenderAvisById(id, avisId);

  if (!avis) {
    notFound();
  }

  const backHref = `/${locale}/dashboard/contractant/appels-offres/${id}?tab=avis`;

  return (
    <main className="p-6 space-y-5 overflow-auto">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[11px] text-slate-500">
          Tableau de bord <span className="mx-1">/</span> Appels d'offres{" "}
          <span className="mx-1">/</span> Consultation avis
        </p>

        <header className="mt-1 mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Consultation d'avis
            </h1>
            <p className="mt-1 text-sm font-medium text-[#4CAF50]">
              AO {id} - Avis {avisId}
            </p>
          </div>
          <AvisDetailActions
            locale={locale}
            aoId={id}
            avisId={avisId}
            backHref={backHref}
            canEdit
          />
        </header>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Type d'avis
            </p>
            <p className="mt-1 font-semibold text-slate-800">
              {getTypeLabel(avis.type)}
            </p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Support
            </p>
            <p className="mt-1 font-semibold text-slate-800">
              {avis.publieBomop && avis.publiePresse
                ? "BOMOP + Presse"
                : getSupportLabel(avis.support)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Date publication
            </p>
            <p className="mt-1 font-semibold text-slate-800">
              {formatDate(avis.publicationDate, locale)}
            </p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Date fin publication
            </p>
            <p className="mt-1 font-semibold text-slate-800">
              {formatDate(avis.publicationEndDate, locale)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700 md:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Statut
            </p>
            <Badge
              variant="outline"
              className={cn(
                "mt-1 h-6 rounded-full px-2 text-[10px] font-semibold",
                avis.isPublished
                  ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                  : "border-slate-200 bg-slate-100 text-slate-700",
              )}
            >
              {avis.isPublished ? "Publie" : "Brouillon"}
            </Badge>
          </div>
        </div>

        <article className="prose mt-4 max-w-none rounded-lg border border-slate-200 bg-white p-4 text-sm prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Contenu de l'avis
          </p>
          <div dangerouslySetInnerHTML={{ __html: avis.content }} />
        </article>
      </section>
    </main>
  );
}
