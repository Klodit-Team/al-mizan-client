"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  type OeAoItem,
  type OeAoLot,
  type OeAoStatus,
  type OeAoType,
} from "@/services/operateur-appels-offres/api";
import { useOperateurAppelOffreDetailQuery } from "@/services/operateur-appels-offres/queries";
import { type Locale } from "@/i18n/config";
import {
  ChevronRight,
  ArrowLeft,
  Calendar,
  MapPin,
  Building2,
  FileText,
  Download,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  Package,
  Info,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<OeAoStatus, string> = {
  publie: "Publié",
  en_cours: "En cours",
  evaluation: "Évaluation",
  attribue: "Attribué",
  annule: "Annulé",
  cloture: "Clôturé",
};

const TYPE_LABELS: Record<OeAoType, string> = {
  ouvert: "Appel d'offres ouvert",
  restreint: "Appel d'offres restreint",
  gre_a_gre: "Gré à gré",
};

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

type DetailTab = "general" | "lots" | "documents" | "soumission";

const TABS: Array<{ key: DetailTab; label: string; icon: React.ReactNode }> = [
  { key: "general", label: "Informations générales", icon: <Info className="h-3.5 w-3.5" /> },
  { key: "lots", label: "Lots", icon: <Package className="h-3.5 w-3.5" /> },
  { key: "documents", label: "Documents CDC", icon: <FileText className="h-3.5 w-3.5" /> },
  { key: "soumission", label: "Ma Soumission", icon: <Send className="h-3.5 w-3.5" /> },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-0.5 py-2.5 sm:grid-cols-[160px_1fr] sm:gap-3">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="text-xs text-slate-700">{value}</dd>
    </div>
  );
}

function GeneralTab({ ao }: { ao: OeAoItem }) {
  return (
    <div className="space-y-4">
      <dl className="divide-y divide-slate-100">
        <InfoRow label="Référence" value={<span className="font-mono font-bold text-[#364150]">{ao.reference}</span>} />
        <InfoRow label="Objet" value={ao.object} />
        <InfoRow label="Organisme" value={ao.organizationName} />
        <InfoRow label="Wilaya" value={ao.wilaya} />
        <InfoRow label="Secteur" value={ao.sector} />
        <InfoRow
          label="Type de procédure"
          value={
            <span className="inline-flex rounded-full bg-sky-50 px-2 py-px text-[11px] font-medium text-sky-700">
              {TYPE_LABELS[ao.type]}
            </span>
          }
        />
        <InfoRow
          label="Statut"
          value={
            <span className={`inline-flex rounded-full border px-2 py-px text-[10px] font-semibold ${statusBadgeClass(ao.status)}`}>
              {STATUS_LABELS[ao.status]}
            </span>
          }
        />
        {ao.estimatedAmount && (
          <InfoRow label="Montant estimé" value={<span className="font-semibold text-[#364150]">{ao.estimatedAmount}</span>} />
        )}
        <InfoRow
          label="Date limite de dépôt"
          value={
            <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
              <Clock className="h-3.5 w-3.5" />
              {new Date(ao.deadline).toLocaleDateString("fr-DZ", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          }
        />
      </dl>

      {/* Eligibility conditions (static mock) */}
      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
          Conditions d&apos;éligibilité
        </h3>
        <ul className="space-y-1.5">
          {[
            "Registre de commerce en cours de validité",
            "Attestation fiscale valide (CNAS/CASNOS)",
            "Bilan des 3 dernières années",
            "Casier judiciaire du gérant",
            "Attestation de qualification technique",
          ].map((cond) => (
            <li key={cond} className="flex items-center gap-2 text-xs text-slate-600">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              {cond}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function LotsTab({ ao }: { ao: OeAoItem }) {
  return (
    <div className="space-y-3">
      {ao.lots.map((lot: OeAoLot) => (
        <article
          key={lot.id}
          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex rounded-full bg-[#4CAF50]/10 px-2 py-px text-[10px] font-bold text-[#4CAF50]">
                LOT {lot.lotNumber}
              </span>
              <h3 className="mt-1.5 text-sm font-semibold text-slate-800">{lot.designation}</h3>
              {lot.estimatedAmount && (
                <p className="mt-1 text-[11px] text-slate-500">
                  Montant estimé :{" "}
                  <span className="font-semibold text-[#364150]">{lot.estimatedAmount}</span>
                </p>
              )}
            </div>
            <button
              type="button"
              className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#4CAF50] px-2.5 py-1.5 text-[11px] font-semibold text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white transition-colors"
            >
              <Send className="h-3 w-3" />
              Soumissionner
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function DocumentsTab() {
  const docs = [
    { name: "Cahier des Charges – Volume I", size: "2.4 MB", type: "PDF" },
    { name: "Cahier des Charges – Volume II (Technique)", size: "5.1 MB", type: "PDF" },
    { name: "Bordereau des Prix Unitaires", size: "320 KB", type: "XLSX" },
    { name: "Formulaire de Soumission", size: "180 KB", type: "DOCX" },
    { name: "Modèle de Caution Bancaire", size: "95 KB", type: "PDF" },
  ];
  return (
    <div className="space-y-2">
      <p className="text-[11px] text-slate-500">
        Téléchargez les documents du dossier de consultation des entreprises (DCE).
      </p>
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
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-[#4CAF50] hover:text-[#4CAF50] transition-colors"
          >
            <Download className="h-3 w-3" />
            Télécharger
          </button>
        </div>
      ))}
    </div>
  );
}

function SoumissionTab({ ao }: { ao: OeAoItem }) {
  if (ao.hasSubmission && ao.submissionStatus) {
    const statusLabel: Record<NonNullable<OeAoItem["submissionStatus"]>, string> = {
      brouillon: "Brouillon",
      deposee: "Déposée",
      recue: "Reçue et horodatée",
      evaluee: "En cours d'évaluation",
      retenue: "Retenue — Attribution provisoire",
      rejetee: "Rejetée",
    };
    const statusColor: Record<NonNullable<OeAoItem["submissionStatus"]>, string> = {
      brouillon: "bg-slate-100 text-slate-600 border-slate-200",
      deposee: "bg-blue-100 text-blue-700 border-blue-200",
      recue: "bg-sky-100 text-sky-700 border-sky-200",
      evaluee: "bg-violet-100 text-violet-700 border-violet-200",
      retenue: "bg-emerald-100 text-emerald-700 border-emerald-200",
      rejetee: "bg-rose-100 text-rose-700 border-rose-200",
    };

    return (
      <div className="space-y-4">
        {/* Status banner */}
        <div className={`flex items-center gap-3 rounded-xl border p-4 ${statusColor[ao.submissionStatus]}`}>
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-bold">Soumission existante</p>
            <p className="text-[11px]">
              Statut actuel :{" "}
              <span className="font-semibold">{statusLabel[ao.submissionStatus]}</span>
            </p>
          </div>
        </div>

        {/* Summary */}
        <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white px-4">
          <InfoRow label="Référence AO" value={ao.reference} />
          <InfoRow label="Lots soumissionnés" value={`${ao.lots.length} lot(s)`} />
          <InfoRow label="Date de dépôt" value="28 oct. 2024 à 14h32" />
          <InfoRow label="Empreinte SHA-256" value={<span className="font-mono text-[10px] break-all text-slate-500">a3f9b2c1d8e4f7…</span>} />
        </dl>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#4CAF50] px-3 py-2 text-xs font-semibold text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            Voir mon dossier
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Télécharger l&apos;accusé de réception
          </button>
        </div>
      </div>
    );
  }

  // Not yet submitted
  const canSubmit = ao.status === "publie" || ao.status === "en_cours";
  const deadline = new Date(ao.deadline);
  const now = new Date();
  const isExpired = deadline < now;

  return (
    <div className="space-y-4">
      {isExpired ? (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          <div>
            <p className="text-sm font-bold">Date limite dépassée</p>
            <p className="text-[11px]">La période de soumission pour cet appel d&apos;offres est clôturée.</p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-700">
          <Info className="h-5 w-5 shrink-0 text-blue-500" />
          <div>
            <p className="text-sm font-bold">Aucune soumission déposée</p>
            <p className="text-[11px]">
              Vous n&apos;avez pas encore soumis d&apos;offre pour cet appel d&apos;offres.
              Date limite :{" "}
              <span className="font-semibold">
                {deadline.toLocaleDateString("fr-DZ", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Checklist */}
      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
          Documents à préparer
        </h3>
        <ul className="space-y-1.5">
          {[
            "Offre technique (cahier des charges rempli)",
            "Bordereau des prix unitaires",
            "Pièces administratives (NIF, NIS, RC, CNAS…)",
            "Caution de soumission bancaire",
            "Bilan financier des 3 dernières années",
          ].map((doc) => (
            <li key={doc} className="flex items-center gap-2 text-xs text-slate-600">
              <div className="h-3.5 w-3.5 shrink-0 rounded border-2 border-slate-300" />
              {doc}
            </li>
          ))}
        </ul>
      </div>

      {canSubmit && !isExpired && (
        <button
          type="button"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 sm:w-auto sm:px-8"
          style={{ backgroundColor: "#4CAF50" }}
        >
          <Send className="h-4 w-4" />
          Commencer ma soumission
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function OeAoDetailPage({ aoId }: { aoId: string }) {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as Locale) || "fr";

  const { data: ao, isLoading } = useOperateurAppelOffreDetailQuery(aoId);
  const [tab, setTab] = useState<DetailTab>("general");

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
        <p className="text-sm font-medium">Appel d&apos;offres introuvable</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
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
          onClick={() => router.push(`/${locale}/dashboard/operateur/appels-offres`)}
          className="hover:text-slate-800 transition-colors"
        >
          Appels d&apos;Offres
        </button>
        <ChevronRight className="h-3 w-3 text-slate-300" />
        <span className="font-mono font-semibold text-slate-700">{ao.reference}</span>
      </nav>

      {/* ── Back + Title ────────────────────────────────────────────────────── */}
      <header className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-[#4CAF50] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour
          </button>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] font-bold text-slate-400">{ao.reference}</span>
              <span className={`inline-flex rounded-full border px-2 py-px text-[10px] font-semibold ${statusBadgeClass(ao.status)}`}>
                {STATUS_LABELS[ao.status]}
              </span>
            </div>
            <h1 className="mt-1.5 text-base font-bold text-slate-900 leading-snug">{ao.object}</h1>

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
                Limite :{" "}
                <span className="font-semibold text-rose-600">
                  {new Date(ao.deadline).toLocaleDateString("fr-DZ", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </span>
            </div>
          </div>

          {/* CTA */}
          {!ao.hasSubmission && (ao.status === "publie" || ao.status === "en_cours") && (
            <button
              type="button"
              onClick={() => setTab("soumission")}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#4CAF50" }}
            >
              <Send className="h-4 w-4" />
              Soumissionner
            </button>
          )}

          {ao.hasSubmission && (
            <button
              type="button"
              onClick={() => setTab("soumission")}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-[#4CAF50] px-4 py-2.5 text-sm font-bold text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white transition-colors"
            >
              <FileText className="h-4 w-4" />
              Voir ma soumission
            </button>
          )}
        </div>
      </header>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Tab bar */}
        <div className="flex overflow-x-auto border-b border-slate-100">
          {TABS.map((t) => (
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
              {t.key === "soumission" && ao.hasSubmission && (
                <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[8px] font-bold text-emerald-700">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-4 md:p-5">
          {tab === "general" && <GeneralTab ao={ao} />}
          {tab === "lots" && <LotsTab ao={ao} />}
          {tab === "documents" && <DocumentsTab />}
          {tab === "soumission" && <SoumissionTab ao={ao} />}
        </div>
      </div>
    </div>
  );
}