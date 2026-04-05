"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { type Locale } from "@/i18n/config";
import {
  CheckCircle2, ChevronRight, Search, FileText,
  Upload, AlertCircle, X, Send, ArrowLeft,
  ShieldCheck, ClipboardList,
} from "lucide-react";

// ─── Types & mock data ────────────────────────────────────────────────────────

type OeAoType   = "ouvert" | "restreint" | "gre_a_gre";
type OeAoStatus = "publie" | "en_cours";

interface AoOption {
  id: string; reference: string; object: string;
  type: OeAoType; status: OeAoStatus;
  organizationName: string; wilaya: string;
  deadline: string;
  lots: Array<{ id: string; lotNumber: string; designation: string; estimatedAmount?: string }>;
}

const AO_OPTIONS: AoOption[] = [
  {
    id: "AO-2024-002", reference: "AO-2024-002",
    object: "Travaux de réhabilitation du réseau routier urbain",
    type: "ouvert", status: "publie",
    organizationName: "Direction des Travaux Publics - Oran",
    wilaya: "Oran", deadline: "2024-11-22",
    lots: [
      { id: "l3", lotNumber: "1", designation: "Terrassement et génie civil", estimatedAmount: "180 000 000 DZD" },
      { id: "l4", lotNumber: "2", designation: "Signalisation et éclairage", estimatedAmount: "140 000 000 DZD" },
    ],
  },
  {
    id: "AO-2024-004", reference: "AO-2024-004",
    object: "Prestation de services de sécurité et gardiennage",
    type: "ouvert", status: "publie",
    organizationName: "Université de Constantine",
    wilaya: "Constantine", deadline: "2024-12-05",
    lots: [
      { id: "l7", lotNumber: "1", designation: "Gardiennage campus principal", estimatedAmount: "8 000 000 DZD" },
      { id: "l8", lotNumber: "2", designation: "Gardiennage résidences", estimatedAmount: "4 000 000 DZD" },
    ],
  },
  {
    id: "AO-2024-005", reference: "AO-2024-005",
    object: "Construction d'une école primaire",
    type: "ouvert", status: "publie",
    organizationName: "Direction de l'éducation - Sidi Bel Abbés",
    wilaya: "Sidi Bel Abbés", deadline: "2024-12-18",
    lots: [
      { id: "l9",  lotNumber: "1", designation: "Gros oeuvre et maçonnerie", estimatedAmount: "90 000 000 DZD" },
      { id: "l10", lotNumber: "2", designation: "Second oeuvre et finitions", estimatedAmount: "60 000 000 DZD" },
    ],
  },
  {
    id: "AO-2024-008", reference: "AO-2024-008",
    object: "Entretien et maintenance des espaces verts municipaux",
    type: "ouvert", status: "publie",
    organizationName: "Commune de Tlemcen",
    wilaya: "Tlemcen", deadline: "2024-12-10",
    lots: [
      { id: "l15", lotNumber: "1", designation: "Entretien parcs et jardins", estimatedAmount: "4 000 000 DZD" },
    ],
  },
];

type DocStatus = "conforme" | "expire" | "manquant" | "uploade";

interface AdminDoc {
  id: string;
  label: string;
  required: boolean;
  status: DocStatus;
  fileName?: string;
  expiry?: string;
}

const INITIAL_DOCS: AdminDoc[] = [
  { id: "rc",     label: "Registre de commerce",       required: true,  status: "conforme", fileName: "RC_BENALI_2024.pdf",    expiry: "2025-06-30" },
  { id: "nif",    label: "Carte NIF",                  required: true,  status: "conforme", fileName: "NIF_BENALI.pdf" },
  { id: "nis",    label: "Attestation NIS",             required: true,  status: "conforme", fileName: "NIS_BENALI.pdf" },
  { id: "cnas",   label: "Attestation CNAS",            required: true,  status: "expire",   fileName: "CNAS_2023.pdf",         expiry: "2024-09-15" },
  { id: "casnos", label: "Attestation CASNOS",          required: true,  status: "manquant" },
  { id: "fiscal", label: "Attestation fiscale",         required: true,  status: "conforme", fileName: "FISCAL_2024.pdf",       expiry: "2024-12-31" },
  { id: "casier", label: "Casier judiciaire du gérant",  required: true,  status: "manquant" },
  { id: "bilan",  label: "Bilan des 3 dernières années",required: false, status: "conforme", fileName: "BILAN_2021_2023.pdf" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function docStatusMeta(s: DocStatus) {
  switch (s) {
    case "conforme": return { label: "Conforme",  bg: "bg-emerald-100", text: "text-emerald-700", icon: <CheckCircle2 className="h-3.5 w-3.5" /> };
    case "expire":   return { label: "Expiré",   bg: "bg-rose-100",    text: "text-rose-700",    icon: <AlertCircle  className="h-3.5 w-3.5" /> };
    case "manquant": return { label: "Manquant",   bg: "bg-amber-100",   text: "text-amber-700",   icon: <AlertCircle  className="h-3.5 w-3.5" /> };
    case "uploade":  return { label: "Chargé",   bg: "bg-blue-100",    text: "text-blue-700",    icon: <CheckCircle2 className="h-3.5 w-3.5" /> };
  }
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("fr-DZ", { day: "numeric", month: "short", year: "numeric" });
}

const TYPE_LABELS: Record<OeAoType, string> = {
  ouvert: "AO ouvert", restreint: "AO restreint", gre_a_gre: "Gré à gré",
};

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Sélection AO",       icon: <Search       className="h-4 w-4" /> },
    { n: 2, label: "Pièces administratives", icon: <ShieldCheck  className="h-4 w-4" /> },
    { n: 3, label: "Offre technique",      icon: <ClipboardList className="h-4 w-4" /> },
  ];
  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
            s.n === step
              ? "bg-[#4CAF50] text-white"
              : s.n < step
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-400"
          }`}>
            <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
              s.n === step ? "bg-white/20" : s.n < step ? "bg-emerald-200" : "bg-slate-200"
            }`}>
              {s.n < step ? <CheckCircle2 className="h-3 w-3" /> : s.n}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-px w-8 ${s.n < step ? "bg-emerald-300" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Step 1 : Select AO ───────────────────────────────────────────────────────

function Step1({
  onNext, selectedAoId, selectedLotIds, onSelectAo, onToggleLot,
}: {
  onNext: () => void;
  selectedAoId: string;
  selectedLotIds: string[];
  onSelectAo: (id: string) => void;
  onToggleLot: (id: string) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = AO_OPTIONS.filter((ao) =>
    !search.trim() ||
    ao.reference.toLowerCase().includes(search.toLowerCase()) ||
    ao.object.toLowerCase().includes(search.toLowerCase()) ||
    ao.organizationName.toLowerCase().includes(search.toLowerCase())
  );

  const selectedAo = AO_OPTIONS.find((ao) => ao.id === selectedAoId);
  const canProceed = !!selectedAoId && selectedLotIds.length > 0;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-slate-800">Sélectionnez un appel d&apos;offres</h2>
        <p className="text-xs text-slate-500">Choisissez l&apos;AO auquel vous souhaitez soumissionner, puis sélectionnez les lots concernés.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un appel d'offres 2026"
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#4CAF50] focus:bg-white transition-colors"
        />
      </div>

      {/* AO list */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {filtered.map((ao) => {
          const isSelected = ao.id === selectedAoId;
          return (
            <button
              key={ao.id}
              type="button"
              onClick={() => onSelectAo(ao.id)}
              className={`w-full rounded-xl border p-3 text-left transition-all ${
                isSelected
                  ? "border-[#4CAF50] bg-emerald-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-[#4CAF50]/40 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-slate-400">{ao.reference}</span>
                    <span className="inline-flex rounded-full bg-sky-50 px-1.5 py-px text-[9px] font-medium text-sky-700">
                      {TYPE_LABELS[ao.type]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-slate-800 leading-snug">{ao.object}</p>
                  <p className="text-[10px] text-slate-500">{ao.organizationName} &middot; {ao.wilaya}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[9px] text-slate-400">Limite</p>
                  <p className="text-[10px] font-semibold text-rose-600">{fmt(ao.deadline)}</p>
                </div>
              </div>
              {isSelected && (
                <div className="mt-2 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#4CAF50]" />
                  <span className="text-[10px] font-semibold text-[#4CAF50]">Sélectionné</span>
                </div>
              )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-6 text-center text-xs text-slate-400">Aucun appel d&apos;offres trouvé</p>
        )}
      </div>

      {/* Lots selection */}
      {selectedAo && (
        <div className="rounded-xl border border-[#4CAF50]/20 bg-emerald-50/50 p-4">
          <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-600">
            Sélectionner les lots &mdash; {selectedAo.reference}
          </h3>
          <div className="space-y-2">
            {selectedAo.lots.map((lot) => {
              const checked = selectedLotIds.includes(lot.id);
              return (
                <label key={lot.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                  checked ? "border-[#4CAF50] bg-white" : "border-slate-200 bg-white hover:bg-slate-50"
                }`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleLot(lot.id)}
                    className="mt-0.5 h-4 w-4 rounded accent-[#4CAF50]"
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Lot {lot.lotNumber} &ndash; {lot.designation}</p>
                    {lot.estimatedAmount && (
                      <p className="text-[10px] text-slate-500">Montant estimé : {lot.estimatedAmount}</p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="button"
          disabled={!canProceed}
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: "#4CAF50" }}
        >
          Continuer <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 2 : Admin docs ──────────────────────────────────────────────────────

function Step2({
  onNext, onBack, docs, onUpload,
}: {
  onNext: () => void;
  onBack: () => void;
  docs: AdminDoc[];
  onUpload: (id: string, file: File) => void;
}) {
  const blockers = docs.filter((d) => d.required && (d.status === "manquant" || d.status === "expire"));
  const canProceed = blockers.length === 0;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-slate-800">Pièces administratives</h2>
        <p className="text-xs text-slate-500">
          Téléversez et vérifiez les documents obligatoires pour votre dossier de soumission.
        </p>
      </div>

      {/* Warning banner if blocking */}
      {blockers.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
          <p className="text-xs text-amber-700">
            <span className="font-semibold">{blockers.length} pièce{blockers.length > 1 ? "s" : ""} bloquante{blockers.length > 1 ? "s" : ""}</span> doivent être mises à jour avant de continuer.
          </p>
        </div>
      )}

      {/* Documents list */}
      <div className="space-y-2">
        {docs.map((doc) => {
          const meta = docStatusMeta(doc.status);
          const isBlocking = doc.required && (doc.status === "manquant" || doc.status === "expire");
          return (
            <div key={doc.id} className={`flex items-center gap-3 rounded-xl border p-3 ${
              isBlocking ? "border-rose-200 bg-rose-50/40" : "border-slate-200 bg-white"
            }`}>
              {/* Icon */}
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.bg}`}>
                <FileText className={`h-4 w-4 ${meta.text}`} />
              </div>
              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-slate-800">{doc.label}</p>
                  {doc.required && <span className="text-[9px] font-bold text-rose-500">*</span>}
                </div>
                {doc.fileName && (
                  <p className="truncate text-[10px] text-slate-500">{doc.fileName}</p>
                )}
                {doc.expiry && (
                  <p className={`text-[10px] ${doc.status === "expire" ? "font-semibold text-rose-600" : "text-slate-400"}`}>
                    Expire le {fmt(doc.expiry)}
                  </p>
                )}
              </div>
              {/* Status badge */}
              <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-px text-[10px] font-semibold ${meta.bg} ${meta.text}`}>
                {meta.icon}{meta.label}
              </span>
              {/* Upload button */}
              <label className={`shrink-0 cursor-pointer inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                isBlocking
                  ? "border-rose-300 text-rose-600 hover:bg-rose-50"
                  : "border-slate-200 text-slate-600 hover:border-[#4CAF50] hover:text-[#4CAF50]"
              }`}>
                <Upload className="h-3 w-3" />
                {doc.status === "manquant" || doc.status === "expire" ? "Téléverser" : "Remplacer"}
                <input
                  type="file"
                  className="sr-only"
                  accept=".pdf,.jpg,.png"
                  onChange={(e) => { if (e.target.files?.[0]) onUpload(doc.id, e.target.files[0]); }}
                />
              </label>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-slate-400">
        <span className="text-rose-500">*</span> Pièces obligatoires. Formats acceptés&nbsp;: PDF, JPG, PNG (max 10 Mo).
      </p>

      <div className="flex items-center justify-between pt-2">
        <button type="button" onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />Retour
        </button>
        <button
          type="button"
          disabled={!canProceed}
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: "#4CAF50" }}
        >
          Continuer <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 3 : Offre technique ─────────────────────────────────────────────────

function Step3({
  onBack, onSubmit, selectedAoId, selectedLotIds,
}: {
  onBack: () => void;
  onSubmit: () => void;
  selectedAoId: string;
  selectedLotIds: string[];
}) {
  const ao = AO_OPTIONS.find((a) => a.id === selectedAoId);
  const selectedLots = ao?.lots.filter((l) => selectedLotIds.includes(l.id)) ?? [];

  const [offreTechFile, setOffreTechFile]     = useState<File | null>(null);
  const [bpuFile, setBpuFile]                 = useState<File | null>(null);
  const [cautionFile, setCautionFile]         = useState<File | null>(null);
  const [montants, setMontants]               = useState<Record<string, string>>({});
  const [cautionRef, setCautionRef]           = useState("");
  const [cautionBanque, setCautionBanque]     = useState("");
  const [cautionMontant, setCautionMontant]   = useState("");
  const [cautionExpiry, setCautionExpiry]     = useState("");

  const canSubmit = !!offreTechFile && !!bpuFile && cautionRef && cautionBanque && cautionMontant && cautionExpiry;

  function FileDropzone({ label, file, onFile, accept = ".pdf" }: {
    label: string; file: File | null; onFile: (f: File) => void; accept?: string;
  }) {
    return (
      <label className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
        file ? "border-[#4CAF50] bg-emerald-50" : "border-slate-200 bg-slate-50 hover:border-[#4CAF50]/60"
      }`}>
        {file ? (
          <>
            <CheckCircle2 className="h-6 w-6 text-[#4CAF50]" />
            <p className="text-xs font-semibold text-[#4CAF50]">{file.name}</p>
            <p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(0)} KB</p>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6 text-slate-400" />
            <p className="text-xs font-semibold text-slate-600">{label}</p>
            <p className="text-[10px] text-slate-400">PDF, max 20 Mo — Cliquer pour choisir</p>
          </>
        )}
        <input type="file" className="sr-only" accept={accept}
          onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files[0]); }} />
      </label>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-bold text-slate-800">Offre technique &amp; financière</h2>
        <p className="text-xs text-slate-500">
          Déposez votre offre technique, le BPU et la caution de soumission pour les lots sélectionnés.
        </p>
      </div>

      {/* Selected lots summary */}
      {ao && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Lots sélectionnés &mdash; {ao.reference}</p>
          <div className="flex flex-wrap gap-1.5">
            {selectedLots.map((lot) => (
              <span key={lot.id} className="inline-flex rounded-full bg-[#4CAF50]/10 px-2 py-px text-[10px] font-semibold text-[#4CAF50]">
                Lot {lot.lotNumber} &ndash; {lot.designation}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Montants par lot */}
      <div>
        <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">Montants de l&apos;offre (HT)</h3>
        <div className="space-y-2">
          {selectedLots.map((lot) => (
            <div key={lot.id} className="flex items-center gap-3">
              <label className="w-48 shrink-0 text-xs font-medium text-slate-700 truncate">
                Lot {lot.lotNumber} &ndash; {lot.designation}
              </label>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={montants[lot.id] ?? ""}
                  onChange={(e) => setMontants((m) => ({ ...m, [lot.id]: e.target.value }))}
                  placeholder="Ex : 42 500 000"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-[#4CAF50] transition-colors"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400">DZD</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* File uploads */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Offre technique <span className="text-rose-500">*</span></p>
          <FileDropzone label="Cahier des charges rempli" file={offreTechFile} onFile={setOffreTechFile} />
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Bordereau des Prix (BPU) <span className="text-rose-500">*</span></p>
          <FileDropzone label="BPU complété et signé" file={bpuFile} onFile={setBpuFile} />
        </div>
      </div>

      {/* Caution */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Caution de soumission <span className="text-rose-500">*</span></h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[10px] font-semibold text-slate-500">Référence de la caution</label>
            <input type="text" value={cautionRef} onChange={(e) => setCautionRef(e.target.value)}
              placeholder="Ex&nbsp;: CAU-2024-00892"
              className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-[#4CAF50] transition-colors" />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold text-slate-500">Banque émettrice</label>
            <input type="text" value={cautionBanque} onChange={(e) => setCautionBanque(e.target.value)}
              placeholder="Ex&nbsp;: BNA, CPA, BADR, etc."
              className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-[#4CAF50] transition-colors" />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold text-slate-500">Montant de la caution (DZD)</label>
            <input type="text" value={cautionMontant} onChange={(e) => setCautionMontant(e.target.value)}
              placeholder="Ex&nbsp;: 1 000 000"
              className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-[#4CAF50] transition-colors" />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold text-slate-500">Date d&apos;expiration</label>
            <input type="date" value={cautionExpiry} onChange={(e) => setCautionExpiry(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-700 outline-none focus:border-[#4CAF50] transition-colors" />
          </div>
        </div>
        <FileDropzone label="Scan de la caution bancaire" file={cautionFile} onFile={setCautionFile} />
      </div>

      {/* Security note */}
      <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700">
        <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
        <p>
          Votre offre financière sera <span className="font-semibold">chiffrée (AES-256-GCM)</span> côté client avant transmission. Elle ne sera accessible qu&apos;à l&apos;ouverture officielle des plis par la commission.
        </p>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button type="button" onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />Retour
        </button>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={onSubmit}
          className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: "#4CAF50" }}
        >
          <Send className="h-4 w-4" />
          Déposer la soumission
        </button>
      </div>
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({ aoRef, onBack }: { aoRef: string; onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="h-9 w-9 text-[#4CAF50]" />
      </div>
      <h2 className="text-lg font-bold text-slate-900">Soumission déposée avec succès&nbsp;!</h2>
      <p className="mt-2 max-w-sm text-xs text-slate-500">
        Votre offre pour <span className="font-semibold">{aoRef}</span> a été reçue et horodatée. Vous recevrez un accusé de réception par notification.
      </p>
      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[11px] font-mono text-emerald-700">
        SHA-256 : a3f9b2c1d8e4f7a0b2c3d4e5f6a7b8c9d0e1f2a3b4c5
      </div>
      <button
        type="button"
        onClick={onBack}
        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#4CAF50] px-5 py-2.5 text-sm font-semibold text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white transition-colors"
      >
        Voir mes soumissions
      </button>
    </div>
  );
}

// ─── Wizard shell ─────────────────────────────────────────────────────────────

export default function SoumissionWizard() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as Locale) || "fr";

  const [step, setStep]               = useState<1 | 2 | 3>(1);
  const [done, setDone]               = useState(false);
  const [selectedAoId, setSelectedAoId] = useState("");
  const [selectedLotIds, setSelectedLotIds] = useState<string[]>([]);
  const [docs, setDocs]               = useState<AdminDoc[]>(INITIAL_DOCS);

  const toggleLot = useCallback((id: string) => {
    setSelectedLotIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const handleUpload = useCallback((docId: string, file: File) => {
    setDocs((prev) => prev.map((d) =>
      d.id === docId ? { ...d, status: "uploade", fileName: file.name } : d
    ));
  }, []);

  const handleSelectAo = (id: string) => {
    setSelectedAoId(id);
    setSelectedLotIds([]);
  };

  const selectedAo = AO_OPTIONS.find((a) => a.id === selectedAoId);

  if (done) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <SuccessScreen aoRef={selectedAo?.reference ?? ""} onBack={() => router.push(`/${locale}/dashboard/operateur/soumissions`)} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <header className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold uppercase tracking-[0.03em] text-slate-900">
              Nouvelle Soumission
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Complétez les 3 étapes pour déposer votre offre
            </p>
          </div>
          <button type="button" onClick={() => router.push(`/${locale}/dashboard/operateur/soumissions`)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-[#4CAF50] transition-colors">
            <X className="h-3.5 w-3.5" />Annuler
          </button>
        </div>
        <StepIndicator step={step} />
      </header>

      {/* Step content */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {step === 1 && (
          <Step1
            onNext={() => setStep(2)}
            selectedAoId={selectedAoId}
            selectedLotIds={selectedLotIds}
            onSelectAo={handleSelectAo}
            onToggleLot={toggleLot}
          />
        )}
        {step === 2 && (
          <Step2
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
            docs={docs}
            onUpload={handleUpload}
          />
        )}
        {step === 3 && (
          <Step3
            onBack={() => setStep(2)}
            onSubmit={() => setDone(true)}
            selectedAoId={selectedAoId}
            selectedLotIds={selectedLotIds}
          />
        )}
      </div>
    </div>
  );
}