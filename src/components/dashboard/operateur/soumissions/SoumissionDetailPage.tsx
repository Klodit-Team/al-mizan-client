"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { type Locale } from "@/i18n/config";
import {
  type OeSoumissionDetailItem,
  type OeSoumissionStatus,
} from "@/services/operateur-soumissions/api";
import { useOperateurSoumissionDetailQuery } from "@/services/operateur-soumissions/queries";
import {
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ShieldCheck,
  Lock,
  Landmark,
  Download,
  Send,
  BarChart2,
  XCircle,
} from "lucide-react";

type DetailTab = "apercu" | "documents" | "financier" | "timeline";

type TimelineEventStatus = "done" | "current" | "pending";

interface TimelineEvent {
  id: string;
  date: string;
  label: string;
  description: string;
  status: TimelineEventStatus;
}

const STATUS_META: Record<OeSoumissionStatus, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  brouillon: { label: "Brouillon", bg: "bg-slate-100", text: "text-slate-600", icon: <Clock className="h-3.5 w-3.5" /> },
  deposee: { label: "Deposee", bg: "bg-blue-100", text: "text-blue-700", icon: <Send className="h-3.5 w-3.5" /> },
  recue: { label: "Recue", bg: "bg-sky-100", text: "text-sky-700", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  evaluee: { label: "Evaluee", bg: "bg-violet-100", text: "text-violet-700", icon: <BarChart2 className="h-3.5 w-3.5" /> },
  retenue: { label: "Retenue", bg: "bg-emerald-100", text: "text-emerald-700", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  rejetee: { label: "Rejetee", bg: "bg-rose-100", text: "text-rose-700", icon: <XCircle className="h-3.5 w-3.5" /> },
};

function fmtDate(iso?: string): string {
  if (!iso) return "-";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("fr-DZ", { day: "numeric", month: "long", year: "numeric" });
}

function fmtDateTime(iso?: string): string {
  if (!iso) return "-";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("fr-DZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toTimelineStatus(
  currentStatus: OeSoumissionStatus,
  stepStatus: OeSoumissionStatus,
): TimelineEventStatus {
  const rank: Record<OeSoumissionStatus, number> = {
    brouillon: 0,
    deposee: 1,
    recue: 2,
    evaluee: 3,
    retenue: 4,
    rejetee: 4,
  };

  const currentRank = rank[currentStatus];
  const stepRank = rank[stepStatus];

  if (currentRank > stepRank) {
    return "done";
  }

  if (currentRank === stepRank) {
    return "current";
  }

  return "pending";
}

function buildTimeline(sub: OeSoumissionDetailItem): TimelineEvent[] {
  const submittedAt = sub.submittedAt || sub.createdAt;

  const base: TimelineEvent[] = [
    {
      id: "t-creation",
      date: fmtDateTime(sub.createdAt),
      label: "Brouillon cree",
      description: "La soumission a ete initialisee et enregistree en brouillon.",
      status: toTimelineStatus(sub.status, "brouillon"),
    },
    {
      id: "t-depot",
      date: fmtDateTime(submittedAt),
      label: "Depot de la soumission",
      description: "Le depot final a ete declenche par l'operateur.",
      status: toTimelineStatus(sub.status, "deposee"),
    },
    {
      id: "t-reception",
      date: fmtDateTime(sub.horodatageServeur || submittedAt),
      label: "Reception et horodatage",
      description: "La plateforme a confirme la reception de l'offre.",
      status: toTimelineStatus(sub.status, "recue"),
    },
    {
      id: "t-eval",
      date: "En attente",
      label: "Evaluation",
      description: "La commission poursuit l'evaluation technique et financiere.",
      status: toTimelineStatus(sub.status, "evaluee"),
    },
  ];

  if (sub.status === "retenue") {
    base.push({
      id: "t-result",
      date: "Resultat publie",
      label: "Attribution provisoire",
      description: "Votre soumission est retenue.",
      status: "current",
    });
  } else if (sub.status === "rejetee") {
    base.push({
      id: "t-result",
      date: "Resultat publie",
      label: "Soumission rejetee",
      description: "Votre soumission n'a pas ete retenue.",
      status: "current",
    });
  } else {
    base.push({
      id: "t-result",
      date: "A planifier",
      label: "Resultat d'attribution",
      description: "Le resultat sera communique apres cloture de l'evaluation.",
      status: "pending",
    });
  }

  return base;
}

function fileNameFromUrl(url?: string): string {
  if (!url) {
    return "Document indisponible";
  }

  const clean = url.split("?")[0];
  const pieces = clean.split("/").filter(Boolean);
  return pieces[pieces.length - 1] || url;
}

function openFile(url?: string) {
  if (!url) {
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

export default function SoumissionDetailPage({ subId }: { subId: string }) {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as Locale) || "fr";

  const [tab, setTab] = useState<DetailTab>("apercu");
  const { data: sub, isLoading, isError } = useOperateurSoumissionDetailQuery(subId);

  const timeline = useMemo(() => (sub ? buildTimeline(sub) : []), [sub]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-14 animate-pulse rounded-xl bg-gray-200" />
        <div className="h-32 animate-pulse rounded-xl bg-gray-200" />
        <div className="h-72 animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  if (isError || !sub) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50 py-16 text-rose-600">
        <AlertCircle className="mb-3 h-10 w-10 opacity-40" />
        <p className="text-sm font-medium">Soumission introuvable</p>
      </div>
    );
  }

  const meta = STATUS_META[sub.status];
  const tabs: Array<{ key: DetailTab; label: string }> = [
    { key: "apercu", label: "Apercu" },
    { key: "documents", label: "Documents" },
    { key: "financier", label: "Offre financiere" },
    { key: "timeline", label: "Suivi" },
  ];

  return (
    <div className="space-y-3">
      <nav className="flex items-center gap-1.5 text-[11px] text-slate-500">
        <button
          type="button"
          onClick={() => router.push(`/${locale}/dashboard/operateur/tableau-de-bord`)}
          className="hover:text-slate-800 transition-colors"
        >
          Tableau de bord
        </button>
        <ChevronRight className="h-3 w-3 text-slate-300" />
        <button
          type="button"
          onClick={() => router.push(`/${locale}/dashboard/operateur/soumissions`)}
          className="hover:text-slate-800 transition-colors"
        >
          Mes soumissions
        </button>
        <ChevronRight className="h-3 w-3 text-slate-300" />
        <span className="font-mono font-semibold text-slate-700">{sub.reference}</span>
      </nav>

      <header className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-[#4CAF50] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />Retour
          </button>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono text-[11px] font-bold text-slate-400">{sub.reference}</span>
              <span className="font-mono text-[11px] font-bold text-slate-400">-&gt;</span>
              <span className="font-mono text-[11px] font-bold text-[#364150]">{sub.aoReference}</span>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-px text-[10px] font-semibold border-transparent ${meta.bg} ${meta.text}`}>
                {meta.icon}{meta.label}
              </span>
            </div>
            <h1 className="text-base font-bold text-slate-900 leading-snug">{sub.aoObject}</h1>
            <p className="mt-0.5 text-[11px] text-slate-500">{sub.organizationName} · {sub.wilaya}</p>
          </div>
          <div className="shrink-0 text-right text-[11px] text-slate-500">
            <p>Deposee le</p>
            <p className="font-semibold text-slate-700">{fmtDate(sub.submittedAt)}</p>
          </div>
        </div>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex overflow-x-auto border-b border-slate-100">
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3 text-[11px] font-semibold transition-colors ${
                tab === item.key ? "border-[#4CAF50] text-[#4CAF50]" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-4 md:p-5">
          {tab === "apercu" && (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Lots soumissionnes</p>
                <div className="space-y-2">
                  {sub.lots.length === 0 ? (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
                      Aucun lot associe.
                    </div>
                  ) : (
                    sub.lots.map((lot) => (
                      <div key={lot.lotId} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                        <div>
                          <span className="inline-flex rounded-full bg-[#4CAF50]/10 px-2 py-px text-[9px] font-bold text-[#4CAF50]">
                            LOT {lot.lotNumber}
                          </span>
                          <span className="ml-2 text-xs font-medium text-slate-700">{lot.designation}</span>
                        </div>
                        <span className="text-xs font-bold text-[#364150]">{lot.montantHt || "-"}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Preuve d'integrite</p>
                <p className="text-[10px] text-slate-500">
                  Horodatage serveur : <span className="font-semibold text-slate-700">{fmtDateTime(sub.horodatageServeur || sub.submittedAt)}</span>
                </p>
                <p className="mt-1 break-all font-mono text-[9px] text-slate-400">
                  SHA-256 (offre financiere) : {sub.offreFinanciere?.hashFichier || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Landmark className="h-4 w-4 text-slate-400" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Caution bancaire</p>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                  <div><span className="text-slate-500">Reference :</span> <span className="font-semibold text-slate-700">{sub.caution?.reference || "-"}</span></div>
                  <div><span className="text-slate-500">Banque :</span> <span className="font-semibold text-slate-700">{sub.caution?.banque || "-"}</span></div>
                  <div><span className="text-slate-500">Montant :</span> <span className="font-semibold text-slate-700">{sub.caution?.montant || "-"}</span></div>
                  <div><span className="text-slate-500">Expiration :</span> <span className="font-semibold text-slate-700">{fmtDate(sub.caution?.dateExpiration)}</span></div>
                </div>
              </div>
            </div>
          )}

          {tab === "documents" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">Documents disponibles pour cette soumission.</p>
              {[
                {
                  icon: <FileText className="h-4 w-4" />,
                  label: "Offre technique",
                  file: fileNameFromUrl(sub.offreTechnique?.fichierUrl),
                  url: sub.offreTechnique?.fichierUrl,
                  color: "text-blue-600 bg-blue-50",
                },
                {
                  icon: <Landmark className="h-4 w-4" />,
                  label: "Caution bancaire",
                  file: fileNameFromUrl(sub.caution?.fichierUrl),
                  url: sub.caution?.fichierUrl,
                  color: "text-amber-600 bg-amber-50",
                },
                {
                  icon: <Lock className="h-4 w-4" />,
                  label: "Offre financiere chiffree",
                  file: fileNameFromUrl(sub.offreFinanciere?.fichierChiffreUrl),
                  url: sub.offreFinanciere?.fichierChiffreUrl,
                  color: "text-violet-600 bg-violet-50",
                },
              ].map((doc) => (
                <div key={doc.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:bg-slate-50 transition-colors">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${doc.color}`}>{doc.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800">{doc.label}</p>
                    <p className="truncate text-[10px] text-slate-400">{doc.file}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openFile(doc.url)}
                    disabled={!doc.url}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[10px] font-medium text-slate-600 hover:border-[#4CAF50] hover:text-[#4CAF50] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Download className="h-3 w-3" />Telecharger
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === "financier" && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-xl border border-violet-100 bg-violet-50 p-3">
                <Lock className="h-4 w-4 shrink-0 text-violet-500 mt-0.5" />
                <p className="text-[11px] text-violet-700">
                  L'offre financiere est chiffree de bout en bout. Les montants ne sont visibles qu'apres dechiffrement officiel.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="grid grid-cols-[auto_1fr_auto] gap-3 bg-slate-50 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <span>Lot</span><span>Designation</span><span className="text-right">Montant HT</span>
                </div>
                {sub.lots.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-slate-500">Aucun lot disponible.</div>
                ) : (
                  sub.lots.map((lot) => (
                    <div key={lot.lotId} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#4CAF50]/10 text-[10px] font-bold text-[#4CAF50]">
                        {lot.lotNumber}
                      </span>
                      <span className="text-xs text-slate-700">{lot.designation}</span>
                      <span className="text-xs font-bold text-[#364150]">{lot.montantHt || "-"}</span>
                    </div>
                  ))
                )}
                <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 border-t border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Total HT</span>
                  <span className="text-xs font-bold text-[#364150]">{sub.financialTotalHt || "-"}</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600">
                <p><span className="font-semibold">Signature verifiee :</span> {sub.offreFinanciere?.signatureVerifiee ? "Oui" : "Non ou non verifiee"}</p>
                <p><span className="font-semibold">Offre dechiffree :</span> {sub.offreFinanciere?.isDechiffree ? "Oui" : "Non"}</p>
                <p><span className="font-semibold">Hash fichier :</span> {sub.offreFinanciere?.hashFichier || "-"}</p>
              </div>
            </div>
          )}

          {tab === "timeline" && (
            <div className="space-y-0">
              {timeline.map((event, index) => (
                <div key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`mt-0.5 h-5 w-5 shrink-0 rounded-full flex items-center justify-center ${
                      event.status === "done" ? "bg-[#4CAF50]" : event.status === "current" ? "bg-blue-500" : "bg-slate-200"
                    }`}>
                      {event.status === "done" && <CheckCircle2 className="h-3 w-3 text-white" />}
                      {event.status === "current" && <Clock className="h-3 w-3 text-white" />}
                      {event.status === "pending" && <span className="h-2 w-2 rounded-full bg-slate-400" />}
                    </div>
                    {index < timeline.length - 1 && (
                      <div className={`w-px flex-1 my-1 ${event.status === "done" ? "bg-[#4CAF50]/30" : "bg-slate-200"}`} style={{ minHeight: "24px" }} />
                    )}
                  </div>
                  <div className="pb-4 min-w-0">
                    <p className={`text-xs font-semibold ${event.status === "pending" ? "text-slate-400" : "text-slate-800"}`}>{event.label}</p>
                    <p className="text-[10px] text-slate-500">{event.date}</p>
                    <p className={`mt-0.5 text-[11px] ${event.status === "pending" ? "text-slate-400" : "text-slate-600"}`}>
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 text-[11px] text-slate-600">
        <div className="flex items-center gap-2 mb-1.5">
          <ShieldCheck className="h-4 w-4 text-slate-400" />
          <span className="font-semibold text-slate-700">Infos de conformite</span>
        </div>
        <p>Dans delai legal : {sub.isDansDelai ? "Oui" : sub.isDansDelai === false ? "Non" : "Non precise"}</p>
        <p>Date limite AO : {fmtDate(sub.aoDeadline)}</p>
      </div>
    </div>
  );
}
