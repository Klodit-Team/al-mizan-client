"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { type Locale } from "@/i18n/config";
import {
  ArrowLeft, ChevronRight, CheckCircle2, Clock, AlertCircle,
  FileText, ShieldCheck, Lock, Landmark, Download, Send,
  BarChart2, XCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type SubStatus = "brouillon" | "deposee" | "recue" | "evaluee" | "retenue" | "rejetee";

interface TimelineEvent {
  id: string;
  date: string;
  label: string;
  description: string;
  status: "done" | "current" | "pending";
}

interface SoumissionDetail {
  id: string;
  aoReference: string;
  aoObject: string;
  organizationName: string;
  wilaya: string;
  aoDeadline: string;
  submittedAt: string;
  status: SubStatus;
  lots: Array<{ lotNumber: string; designation: string; montantHT: string }>;
  sha256: string;
  horodatage: string;
  cautionRef: string;
  cautionBanque: string;
  cautionMontant: string;
  cautionExpiry: string;
  techFile: string;
  timeline: TimelineEvent[];
}

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_DETAIL: Record<string, SoumissionDetail> = {
  "SUB-001": {
    id: "SUB-001", aoReference: "AO-2024-001",
    aoObject: "Fourniture et installation d'équipements informatiques",
    organizationName: "Direction des Systèmes d'Information - Alger",
    wilaya: "Alger", aoDeadline: "2024-11-15",
    submittedAt: "2024-10-28T14:32:18",
    status: "deposee",
    lots: [
      { lotNumber: "1", designation: "Serveurs et équipements réseaux", montantHT: "24 800 000 DZD" },
      { lotNumber: "2", designation: "Postes de travail et périphèriques", montantHT: "19 400 000 DZD" },
    ],
    sha256: "a3f9b2c1d8e4f7a0b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7",
    horodatage: "28 oct. 2024 à 14:32:18 UTC+1",
    cautionRef: "CAU-2024-00892",
    cautionBanque: "BNA – Banque Nationale d'Algérie",
    cautionMontant: "1 000 000 DZD",
    cautionExpiry: "2025-02-28",
    techFile: "Offre_Technique_AO2024001.pdf",
    timeline: [
      { id: "t1", date: "28 oct. 2024 — 14:32", label: "Dépôt de la soumission", description: "Offre déposée et horodatée avec succès.", status: "done" },
      { id: "t2", date: "28 oct. 2024 — 14:32", label: "Accusé de réception", description: "Notification envoyée par email et sur la plateforme.", status: "done" },
      { id: "t3", date: "15 nov. 2024 — 16:00", label: "Clôture des dépôts", description: "Fin de la période de soumission.", status: "current" },
      { id: "t4", date: "À planifier", label: "Séance d’ouverture des plis", description: "Ouverture publique des offres techniques.", status: "pending" },
      { id: "t5", date: "À planifier", label: "Évaluation technique", description: "Notation des offres par la commission.", status: "pending" },
      { id: "t6", date: "À planifier", label: "Résultat d'attribution", description: "Attribution provisoire publiée.", status: "pending" },
    ],
  },
  "SUB-003": {
    id: "SUB-003", aoReference: "AO-2024-006",
    aoObject: "Fourniture de mobilier de bureau pour administrations",
    organizationName: "Wilaya d'Annaba",
    wilaya: "Annaba", aoDeadline: "2024-11-08",
    submittedAt: "2024-10-05T09:15:00",
    status: "retenue",
    lots: [
      { lotNumber: "1", designation: "Mobilier de bureau standard", montantHT: "4 950 000 DZD" },
      { lotNumber: "2", designation: "Mobilier de direction", montantHT: "3 400 000 DZD" },
    ],
    sha256: "f7e6d5c4b3a2019876543210abcdef0123456789abcdef01",
    horodatage: "05 oct. 2024 à 09:15:00 UTC+1",
    cautionRef: "CAU-2024-00645",
    cautionBanque: "CPA - Crédit Populaire d'Algérie",
    cautionMontant: "500 000 DZD",
    cautionExpiry: "2025-01-31",
    techFile: "Offre_Technique_AO2024006.pdf",
    timeline: [
      { id: "t1", date: "05 oct. 2024 — 09:15", label: "Dépôt de la soumission", description: "Offre déposée et horodatée.", status: "done" },
      { id: "t2", date: "08 nov. 2024 — 10:00", label: "Ouverture des plis", description: "Séance publique d’ouverture des plis techniques.", status: "done" },
      { id: "t3", date: "18 nov. 2024 — 14:00", label: "Évaluation technique validée", description: "Votre offre a obtenu 87/100.", status: "done" },
      { id: "t4", date: "22 nov. 2024 — 11:30", label: "Attribution provisoire", description: "Votre offre est retenue pour les lots 1 et 2.", status: "done" },
      { id: "t5", date: "À planifier", label: "Délai de recours", description: "Période de recours contractuel (10 jours).", status: "current" },
      { id: "t6", date: "À planifier", label: "Attribution définitive", description: "Signature du marché.", status: "pending" },
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<SubStatus, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  brouillon: { label: "Brouillon",   bg: "bg-slate-100",   text: "text-slate-600",   icon: <Clock        className="h-3.5 w-3.5" /> },
  deposee:   { label: "Déposée",    bg: "bg-blue-100",    text: "text-blue-700",    icon: <Send         className="h-3.5 w-3.5" /> },
  recue:     { label: "Reçue",       bg: "bg-sky-100",     text: "text-sky-700",     icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  evaluee:   { label: "Évaluée",    bg: "bg-violet-100",  text: "text-violet-700",  icon: <BarChart2    className="h-3.5 w-3.5" /> },
  retenue:   { label: "Retenue",      bg: "bg-emerald-100", text: "text-emerald-700", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  rejetee:   { label: "Rejetée",    bg: "bg-rose-100",    text: "text-rose-700",    icon: <XCircle      className="h-3.5 w-3.5" /> },
};

function fmtDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-DZ", { day: "numeric", month: "long", year: "numeric" });
}

type DetailTab = "apercu" | "documents" | "financier" | "timeline";

// ─── Main component ───────────────────────────────────────────────────────────

export default function SoumissionDetailPage({ subId }: { subId: string }) {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as Locale) || "fr";

  const [tab, setTab] = useState<DetailTab>("apercu");

  const sub = MOCK_DETAIL[subId];

  if (!sub) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50 py-16 text-rose-600">
        <AlertCircle className="mb-3 h-10 w-10 opacity-40" />
        <p className="text-sm font-medium">Soumission introuvable</p>
      </div>
    );
  }

  const meta   = STATUS_META[sub.status];
  const totalHT = sub.lots.reduce((sum, l) => {
    const n = parseFloat(l.montantHT.replace(/\s/g, "").replace(" DZD", "").replace(",", ".")) || 0;
    return sum + n;
  }, 0);

  const TABS: Array<{ key: DetailTab; label: string }> = [
    { key: "apercu",    label: "Aperçu" },
    { key: "documents", label: "Documents" },
    { key: "financier", label: "Offre financière" },
    { key: "timeline",  label: "Suivi" },
  ];

  return (
    <div className="space-y-3">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[11px] text-slate-500">
        <button type="button" onClick={() => router.push(`/${locale}/dashboard/operateur/tableau-de-bord`)}
          className="hover:text-slate-800 transition-colors">Tableau de bord</button>
        <ChevronRight className="h-3 w-3 text-slate-300" />
        <button type="button" onClick={() => router.push(`/${locale}/dashboard/operateur/soumissions`)}
          className="hover:text-slate-800 transition-colors">Mes soumissions</button>
        <ChevronRight className="h-3 w-3 text-slate-300" />
        <span className="font-mono font-semibold text-slate-700">{sub.id}</span>
      </nav>

      {/* Header */}
      <header className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-2">
          <button type="button" onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-[#4CAF50] transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />Retour
          </button>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono text-[11px] font-bold text-slate-400">{sub.id}</span>
              <span className="font-mono text-[11px] font-bold text-slate-400">&rarr;</span>
              <span className="font-mono text-[11px] font-bold text-[#364150]">{sub.aoReference}</span>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-px text-[10px] font-semibold border-transparent ${meta.bg} ${meta.text}`}>
                {meta.icon}{meta.label}
              </span>
            </div>
            <h1 className="text-base font-bold text-slate-900 leading-snug">{sub.aoObject}</h1>
            <p className="mt-0.5 text-[11px] text-slate-500">{sub.organizationName} &middot; {sub.wilaya}</p>
          </div>
          <div className="shrink-0 text-right text-[11px] text-slate-500">
            <p>Déposée le</p>
            <p className="font-semibold text-slate-700">{fmtDate(sub.submittedAt)}</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex overflow-x-auto border-b border-slate-100">
          {TABS.map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3 text-[11px] font-semibold transition-colors ${
                tab === t.key ? "border-[#4CAF50] text-[#4CAF50]" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4 md:p-5">

          {/* ── Aperçu ──────────────────────────────────────────────────────── */}
          {tab === "apercu" && (
            <div className="space-y-4">
              {/* Lots */}
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Lots soumissionnés</p>
                <div className="space-y-2">
                  {sub.lots.map((lot) => (
                    <div key={lot.lotNumber} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <div>
                        <span className="inline-flex rounded-full bg-[#4CAF50]/10 px-2 py-px text-[9px] font-bold text-[#4CAF50]">LOT {lot.lotNumber}</span>
                        <span className="ml-2 text-xs font-medium text-slate-700">{lot.designation}</span>
                      </div>
                      <span className="text-xs font-bold text-[#364150]">{lot.montantHT}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Integrity */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Preuve d&apos;intégrité</p>
                <p className="text-[10px] text-slate-500">Horodatage : <span className="font-semibold text-slate-700">{sub.horodatage}</span></p>
                <p className="mt-1 break-all font-mono text-[9px] text-slate-400">SHA-256 : {sub.sha256}</p>
              </div>
              {/* Caution summary */}
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Landmark className="h-4 w-4 text-slate-400" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Caution bancaire</p>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                  <div><span className="text-slate-500">Référence :</span> <span className="font-semibold text-slate-700">{sub.cautionRef}</span></div>
                  <div><span className="text-slate-500">Banque :</span> <span className="font-semibold text-slate-700">{sub.cautionBanque}</span></div>
                  <div><span className="text-slate-500">Montant :</span> <span className="font-semibold text-slate-700">{sub.cautionMontant}</span></div>
                  <div><span className="text-slate-500">Expiration :</span> <span className="font-semibold text-slate-700">{fmtDate(sub.cautionExpiry)}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* ── Documents ───────────────────────────────────────────────────── */}
          {tab === "documents" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">Documents déposés avec cette soumission.</p>
              {[
                { icon: <FileText className="h-4 w-4" />, label: "Offre technique", file: sub.techFile, color: "text-blue-600 bg-blue-50" },
                { icon: <Landmark className="h-4 w-4" />, label: "Caution bancaire", file: "Caution_" + sub.cautionRef + ".pdf", color: "text-amber-600 bg-amber-50" },
                { icon: <ShieldCheck className="h-4 w-4" />, label: "Pièces administratives (archive)", file: "PiecesAdmin_" + sub.id + ".zip", color: "text-emerald-600 bg-emerald-50" },
                { icon: <Lock className="h-4 w-4" />, label: "Offre financière (chiffrée)", file: "OffreFinanciere_" + sub.id + ".enc", color: "text-violet-600 bg-violet-50" },
              ].map((d) => (
                <div key={d.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:bg-slate-50 transition-colors">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${d.color}`}>{d.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800">{d.label}</p>
                    <p className="truncate text-[10px] text-slate-400">{d.file}</p>
                  </div>
                  <button type="button"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[10px] font-medium text-slate-600 hover:border-[#4CAF50] hover:text-[#4CAF50] transition-colors">
                    <Download className="h-3 w-3" />Télécharger
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── Financier ───────────────────────────────────────────────────── */}
          {tab === "financier" && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-xl border border-violet-100 bg-violet-50 p-3">
                <Lock className="h-4 w-4 shrink-0 text-violet-500 mt-0.5" />
                <p className="text-[11px] text-violet-700">
                  L&apos;offre financière est <span className="font-semibold">chiffrée E2EE</span>. Les montants ci-dessous sont ceux que vous avez saisis.
                  Ils ne seront déchiffrés qu&apos;à l&apos;ouverture officielle des plis.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="grid grid-cols-[auto_1fr_auto] gap-3 bg-slate-50 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <span>Lot</span><span>Désignation</span><span className="text-right">Montant HT</span>
                </div>
                {sub.lots.map((lot) => (
                  <div key={lot.lotNumber} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#4CAF50]/10 text-[10px] font-bold text-[#4CAF50]">
                      {lot.lotNumber}
                    </span>
                    <span className="text-xs text-slate-700">{lot.designation}</span>
                    <span className="text-xs font-bold text-[#364150]">{lot.montantHT}</span>
                  </div>
                ))}
                {sub.lots.length > 1 && (
                  <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 border-t border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Total général HT</span>
                    <span className="text-xs font-bold text-[#364150]">
                      {totalHT.toLocaleString("fr-DZ", { minimumFractionDigits: 2 })} DZD
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Timeline ────────────────────────────────────────────────────── */}
          {tab === "timeline" && (
            <div className="space-y-0">
              {sub.timeline.map((ev, i) => (
                <div key={ev.id} className="flex gap-3">
                  {/* Dot + line */}
                  <div className="flex flex-col items-center">
                    <div className={`mt-0.5 h-5 w-5 shrink-0 rounded-full flex items-center justify-center ${
                      ev.status === "done"    ? "bg-[#4CAF50]" :
                      ev.status === "current" ? "bg-blue-500"  : "bg-slate-200"
                    }`}>
                      {ev.status === "done"    && <CheckCircle2 className="h-3 w-3 text-white" />}
                      {ev.status === "current" && <Clock        className="h-3 w-3 text-white" />}
                      {ev.status === "pending" && <span className="h-2 w-2 rounded-full bg-slate-400" />}
                    </div>
                    {i < sub.timeline.length - 1 && (
                      <div className={`w-px flex-1 my-1 ${ev.status === "done" ? "bg-[#4CAF50]/30" : "bg-slate-200"}`} style={{ minHeight: "24px" }} />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pb-4 min-w-0">
                    <p className={`text-xs font-semibold ${
                      ev.status === "pending" ? "text-slate-400" : "text-slate-800"
                    }`}>{ev.label}</p>
                    <p className="text-[10px] text-slate-500">{ev.date}</p>
                    <p className={`mt-0.5 text-[11px] ${ev.status === "pending" ? "text-slate-400" : "text-slate-600"}`}>
                      {ev.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}