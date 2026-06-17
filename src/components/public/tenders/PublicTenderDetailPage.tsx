"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  type OeAoItem,
  type OeAoLot,
  type OeAoStatus,
} from "@/services/operateur-appels-offres/api";
import { usePublicAppelOffreDetailQuery } from "@/services/public/public-appels-offres-queries";
import {
  listServiceContractantTenderAvis,
  type TenderAvisItem,
  type TenderAvisType,
} from "@/services/tendersAvis";
import { apiClient } from "@/services/client";
import { type Locale } from "@/i18n/config";
import {
  ChevronRight,
  ArrowLeft,
  Calendar,
  MapPin,
  Building2,
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  Package,
  Info,
  Megaphone,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function statusBadgeClass(status: OeAoStatus) {
  switch (status) {
    case "publie":      return "bg-blue-100 text-blue-700 border-blue-200";
    case "en_cours":   return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "evaluation": return "bg-violet-100 text-violet-700 border-violet-200";
    case "attribue":   return "bg-amber-100 text-amber-700 border-amber-200";
    case "annule":     return "bg-slate-100 text-slate-500 border-slate-200";
    case "cloture":    return "bg-gray-100 text-gray-500 border-gray-200";
  }
}

function getAvisTypeLabel(type: TenderAvisType) {
  switch (type) {
    case "ao":                    return "AO";
    case "attribution_provisoire": return "Attribution provisoire";
    case "attribution_definitive": return "Attribution définitive";
    case "annulation":            return "Annulation";
    case "rectificatif":          return "Rectificatif";
    default:                      return type;
  }
}

function formatAvisDate(dateValue: string, locale: string) {
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return dateValue;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ" : "fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

type DetailTab = "general" | "lots" | "documents" | "avis";

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-0.5 py-2.5 sm:grid-cols-[160px_1fr] sm:gap-3">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="text-xs text-slate-700">{value}</dd>
    </div>
  );
}

function GeneralTab({
  ao,
  dict,
  locale,
}: {
  ao: OeAoItem;
  dict: any;
  locale: string;
}) {
  const [eligibilityCriteria, setEligibilityCriteria] = useState<
    { id: string; libelle: string; valeurMinimale?: string }[]
  >([]);

  useEffect(() => {
    apiClient<{ id: string; libelle?: string; valeurMinimale?: string }[]>(
      `/api/v1/appels-offres/${ao.id}/criteres-eligibilite`,
      { method: "GET" },
    )
      .then((data) => {
        const items = Array.isArray(data) ? data : (data as any)?.data || [];
        if (items.length > 0) setEligibilityCriteria(items);
      })
      .catch(() => {});
  }, [ao.id]);

  return (
    <div className="space-y-4">
      <dl className="divide-y divide-slate-100">
        <InfoRow
          label={dict.general.reference}
          value={
            <span className="font-mono font-bold text-[#364150]">
              {ao.reference}
            </span>
          }
        />
        <InfoRow label={dict.general.object} value={ao.object} />
        <InfoRow label={dict.general.organization} value={ao.organizationName} />
        <InfoRow label={dict.general.wilaya} value={ao.wilaya} />
        <InfoRow label={dict.general.sector} value={ao.sector} />
        <InfoRow
          label={dict.general.type}
          value={
            <span className="inline-flex rounded-full bg-sky-50 px-2 py-px text-[11px] font-medium text-sky-700">
              {dict.typeLabels[ao.type]}
            </span>
          }
        />
        <InfoRow
          label={dict.general.status}
          value={
            <span
              className={`inline-flex rounded-full border px-2 py-px text-[10px] font-semibold ${statusBadgeClass(ao.status)}`}
            >
              {dict.statusLabels[ao.status]}
            </span>
          }
        />
        {ao.estimatedAmount && (
          <InfoRow
            label={dict.general.estimatedAmount}
            value={
              <span className="font-semibold text-[#364150]">
                {ao.estimatedAmount}
              </span>
            }
          />
        )}
        <InfoRow
          label={dict.general.deadline}
          value={
            <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
              <Clock className="h-3.5 w-3.5" />
              {new Date(ao.deadline).toLocaleDateString(
                locale === "ar" ? "ar-DZ" : "fr-DZ",
                {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                },
              )}
            </span>
          }
        />
      </dl>

      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
          {dict.general.eligibility}
        </h3>
        <ul className="space-y-1.5">
          {eligibilityCriteria.length > 0
            ? eligibilityCriteria.map((crit) => (
                <li
                  key={crit.id}
                  className="flex items-center gap-2 text-xs text-slate-600"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  {crit.libelle}
                  {crit.valeurMinimale ? ` — ${crit.valeurMinimale}` : ""}
                </li>
              ))
            : (dict.general.eligibilityMock || []).map((cond: string) => (
                <li
                  key={cond}
                  className="flex items-center gap-2 text-xs text-slate-600"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  {cond}
                </li>
              ))}
        </ul>
      </div>
    </div>
  );
}

function LotsTab({ ao, dict }: { ao: OeAoItem; dict: any }) {
  return (
    <div className="space-y-3">
      {ao.lots.map((lot: OeAoLot) => (
        <article
          key={lot.id}
          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <span className="inline-flex rounded-full bg-[#4CAF50]/10 px-2 py-px text-[10px] font-bold text-[#4CAF50]">
            {dict.lots.lot} {lot.lotNumber}
          </span>
          <h3 className="mt-1.5 text-sm font-semibold text-slate-800">
            {lot.designation}
          </h3>
          {lot.estimatedAmount && (
            <p className="mt-1 text-[11px] text-slate-500">
              {dict.lots.estimatedAmount}{" "}
              <span className="font-semibold text-[#364150]">
                {lot.estimatedAmount}
              </span>
            </p>
          )}
        </article>
      ))}
    </div>
  );
}

function DocumentsTab({ aoId, dict }: { aoId: string; dict: any }) {
  const [docs, setDocs] = useState<
    { name: string; size: string; type: string; url?: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const cdcResult = await apiClient<{
          url?: string;
          documentId?: string;
          prixRetrait?: number;
        }>(`/api/v1/appels-offres/${aoId}/cdc`, { method: "GET" }).catch(
          () => null,
        );

        if (cdcResult && cdcResult.url) {
          setDocs([
            {
              name: "Cahier des Charges (CDC)",
              size: "PDF",
              type: "PDF",
              url: cdcResult.url,
            },
          ]);
        } else {
          setDocs([]);
        }
      } catch {
        setDocs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [aoId]);

  if (loading) {
    return <div className="animate-pulse h-20 rounded-lg bg-slate-100" />;
  }

  if (docs.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
        <FileText className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-2 text-xs font-medium text-slate-500">
          {dict.documents?.empty ||
            "Aucun document disponible pour cet appel d'offres."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-slate-500">{dict.documents.desc}</p>
      {docs.map((doc) => (
        <div
          key={doc.name}
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-slate-200 text-[9px] font-bold text-slate-600">
              {doc.type}
            </span>
            <div>
              <p className="text-xs font-medium text-slate-800">{doc.name}</p>
              <p className="text-[10px] text-slate-400">{doc.size}</p>
            </div>
          </div>
          <a
            href={doc.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-[#4CAF50] hover:text-[#4CAF50] transition-colors"
          >
            <Download className="h-3 w-3" />
            {dict.documents.download}
          </a>
        </div>
      ))}
    </div>
  );
}

function AvisTab({ aoId, locale }: { aoId: string; locale: string }) {
  const [avis, setAvis] = useState<TenderAvisItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listServiceContractantTenderAvis(aoId)
      .then((items) =>
        setAvis(items.filter((item) => item.isPublished)),
      )
      .catch(() => setAvis([]))
      .finally(() => setLoading(false));
  }, [aoId]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />
        ))}
      </div>
    );
  }

  if (avis.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
        <Megaphone className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-2 text-xs font-medium text-slate-500">
          Aucun avis publié pour cet appel d'offres.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {avis.map((item) => (
        <article
          key={item.id}
          className="rounded-lg border border-slate-200 bg-slate-50 p-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-[#4CAF50]/10 px-2 py-px text-[10px] font-bold text-[#4CAF50]">
                {getAvisTypeLabel(item.type)}
              </span>
              {item.publieBomop && (
                <span className="inline-flex rounded-full bg-slate-100 px-2 py-px text-[10px] text-slate-600">
                  BOMOP
                </span>
              )}
              {item.publiePresse && (
                <span className="inline-flex rounded-full bg-slate-100 px-2 py-px text-[10px] text-slate-600">
                  Presse
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400">
              {formatAvisDate(item.publicationDate, locale)}
            </span>
          </div>
          <h3 className="mt-1.5 text-xs font-semibold text-slate-800">
            {item.title}
          </h3>
          {item.content && (
            <div
              className="mt-1 text-[11px] text-slate-600 line-clamp-2"
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          )}
        </article>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function PublicTenderDetailPage({
  aoId,
  dict,
  locale,
}: {
  aoId: string;
  dict: any;
  locale: string;
}) {
  const router = useRouter();
  const { data: ao, isLoading } = usePublicAppelOffreDetailQuery(aoId);
  const [tab, setTab] = useState<DetailTab>("general");

  const tabs = [
    {
      key: "general" as const,
      label: dict.tabs.general,
      icon: <Info className="h-3.5 w-3.5" />,
    },
    {
      key: "lots" as const,
      label: dict.tabs.lots,
      icon: <Package className="h-3.5 w-3.5" />,
    },
    {
      key: "documents" as const,
      label: dict.tabs.documents,
      icon: <FileText className="h-3.5 w-3.5" />,
    },
    {
      key: "avis" as const,
      label: "Avis",
      icon: <Megaphone className="h-3.5 w-3.5" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-14 animate-pulse rounded-xl bg-gray-200" />
        <div className="h-32 animate-pulse rounded-xl bg-gray-200" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  if (!ao) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50 py-16 text-rose-600">
        <AlertCircle className="mb-3 h-10 w-10 opacity-40" />
        <p className="text-sm font-medium">{dict.page.notFound}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-[11px] text-slate-500">
        <button
          type="button"
          onClick={() => router.push(`/${locale}/tenders`)}
          className="hover:text-slate-800 transition-colors"
        >
          Appels d'offres
        </button>
        <ChevronRight className="h-3 w-3 text-slate-300" />
        <span className="font-mono font-semibold text-slate-700">
          {ao.reference}
        </span>
      </nav>

      {/* ── Back + Title ────────────────────────────────────────────────────── */}
      <header className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-[#4CAF50] transition-colors"
          >
            <ArrowLeft
              className={`h-3.5 w-3.5 ${locale === "ar" ? "rotate-180" : ""}`}
            />
            {dict.page.back}
          </button>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] font-bold text-slate-400">
                {ao.reference}
              </span>
              <span
                className={`inline-flex rounded-full border px-2 py-px text-[10px] font-semibold ${statusBadgeClass(ao.status)}`}
              >
                {dict.statusLabels[ao.status]}
              </span>
            </div>
            <h1 className="mt-1.5 text-base font-bold text-slate-900 leading-snug">
              {ao.object}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                {ao.organizationName}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {ao.wilaya}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {dict.page.deadline}{" "}
                <span className="font-semibold text-rose-600">
                  {new Date(ao.deadline).toLocaleDateString(
                    locale === "ar" ? "ar-DZ" : "fr-DZ",
                    { day: "numeric", month: "short", year: "numeric" },
                  )}
                </span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex overflow-x-auto border-b border-slate-100">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3 text-[11px] font-semibold transition-colors ${
                tab === t.key
                  ? "border-[#4CAF50] text-[#4CAF50]"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4 md:p-5">
          {tab === "general" && (
            <GeneralTab ao={ao} dict={dict} locale={locale} />
          )}
          {tab === "lots" && <LotsTab ao={ao} dict={dict} />}
          {tab === "documents" && (
            <DocumentsTab aoId={aoId} dict={dict} />
          )}
          {tab === "avis" && <AvisTab aoId={aoId} locale={locale} />}
        </div>
      </div>
    </div>
  );
}