"use client";

import { useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { type Locale } from "@/i18n/config";
import {
  ArrowLeft, Clock, Upload, X, FileText, AlertCircle, CheckCircle2, Send,
  Building2, CalendarDays, DollarSign,
} from "lucide-react";

// ─── Mock data ────────────────────────────────────────────────────────────────

interface EligibleSoumission {
  aoReference: string;
  aoObject: string;
  dateFinRecours: string;
  attribution: {
    winner: string;
    montantAttribue: string;
    dateAttribution: string;
  };
}

const ELIGIBLE_SOUMISSIONS: Record<string, EligibleSoumission> = {
  "AO-2024-005": {
    aoReference: "AO-2024-005",
    aoObject: "Réhabilitation du réseau d'assainissement — Wilaya de Béjaïa",
    dateFinRecours: "2026-12-28",
    attribution: {
      winner: "HydroConstruct EURL",
      montantAttribue: "98 500 000 DZD",
      dateAttribution: "2024-12-08",
    },
  },
  "AO-2024-009": {
    aoReference: "AO-2024-009",
    aoObject: "Fourniture de véhicules utilitaires pour administration",
    dateFinRecours: "2025-01-05",
    attribution: {
      winner: "AutoFlotte Algérie SPA",
      montantAttribue: "74 200 000 DZD",
      dateAttribution: "2024-12-15",
    },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysRemaining(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("fr-DZ", {
    day: "numeric", month: "long", year: "numeric",
  });
}

interface UploadedFile {
  id: string;
  name: string;
  size: string;
}

// ─── Context info row ─────────────────────────────────────────────────────────

function InfoItem({ icon, label, value }: {
  icon: React.ReactNode; label: string; value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 text-xs font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function FileRecoursPage() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const router       = useRouter();
  const locale       = (params?.locale as Locale) || "fr";

  const aoRef      = searchParams.get("ao") || "";
  const soumission = ELIGIBLE_SOUMISSIONS[aoRef] || null;

  const [motif, setMotif]           = useState("");
  const [files, setFiles]           = useState<UploadedFile[]>([]);
  const [submitted, setSubmitted]   = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const days      = soumission ? daysRemaining(soumission.dateFinRecours) : 0;
  const isExpired = days <= 0;

  function addFile(f: File) {
    const size = f.size < 1024 * 1024
      ? `${(f.size / 1024).toFixed(0)} KB`
      : `${(f.size / 1024 / 1024).toFixed(1)} MB`;
    setFiles((prev) => [...prev, { id: crypto.randomUUID(), name: f.name, size }]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    Array.from(e.dataTransfer.files).forEach(addFile);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) Array.from(e.target.files).forEach(addFile);
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function handleSubmit() {
    if (!motif.trim()) return;
    setSubmitted(true);
  }

  // ── Success state ────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Recours déposé avec succès</h2>
        <p className="mt-3 max-w-sm text-sm text-slate-500">
          Votre recours a bien été enregistré. Vous pouvez suivre son avancement depuis la liste de vos recours.
        </p>
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => router.push(`/${locale}/dashboard/operateur/recours`)}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#4CAF50" }}
          >
            Voir mes recours
          </button>
        </div>
      </div>
    );
  }

  // ── No AO selected ───────────────────────────────────────────────────────

  if (!soumission) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <button type="button" onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">Déposer un recours</h1>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <AlertCircle className="h-7 w-7 text-amber-600" />
          </div>
          <p className="text-base font-semibold text-amber-900">Aucun appel d&rsquo;offres éligible sélectionné</p>
          <p className="mt-2 text-sm text-amber-700 max-w-md mx-auto">
            Le recours doit être initié depuis la page de détail d&rsquo;un AO dont le statut est
            «&nbsp;Attribution provisoire&nbsp;» et pour lequel vous n&rsquo;avez pas été retenu.
          </p>
          <button
            type="button"
            onClick={() => router.push(`/${locale}/dashboard/operateur/soumissions`)}
            className="mt-5 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
          >
            Voir mes soumissions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <button type="button" onClick={() => router.back()}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Déposer un recours</h1>
          <p className="text-xs text-slate-500">
            Contestation de l&rsquo;attribution provisoire — <span className="font-semibold" style={{ color: "#4CAF50" }}>{soumission.aoReference}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">

          {/* Context card */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">Contexte de l&rsquo;attribution provisoire</h2>
            <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Appel d&rsquo;offres</p>
              <p className="mt-0.5 font-mono text-sm font-bold" style={{ color: "#4CAF50" }}>{soumission.aoReference}</p>
              <p className="text-sm text-slate-700">{soumission.aoObject}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 border-t border-slate-100 pt-4">
              <InfoItem
                icon={<Building2 className="h-4 w-4" />}
                label="Attributaire provisoire"
                value={soumission.attribution.winner}
              />
              <InfoItem
                icon={<DollarSign className="h-4 w-4" />}
                label="Montant attribué"
                value={soumission.attribution.montantAttribue}
              />
              <InfoItem
                icon={<CalendarDays className="h-4 w-4" />}
                label="Date attribution"
                value={fmt(soumission.attribution.dateAttribution)}
              />
            </div>
          </section>

          {/* Form */}
          {!isExpired && (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">Contenu du recours</h2>

              {/* Motif */}
              <div className="mb-5">
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Motif du recours <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  rows={8}
                  placeholder="Décrivez en détail les motifs de votre recours : irrégularités constatées dans la procédure d'attribution, critères d'évaluation mal appliqués, non-conformité avec le CDC…"
                  className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#4CAF50] focus:bg-white transition-colors"
                />
                <div className="mt-1 flex justify-between">
                  <p className="text-[10px] text-slate-400">Minimum 50 caractères recommandés</p>
                  <p className="text-[10px] text-slate-400">{motif.length} caractères</p>
                </div>
              </div>

              {/* Pièces jointes */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Pièces jointes</label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                    isDragging ? "border-[#4CAF50] bg-emerald-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <Upload className="mb-2 h-6 w-6 text-slate-400" />
                  <p className="text-sm font-medium text-slate-600">Glissez vos fichiers ici</p>
                  <p className="text-xs text-slate-400">ou</p>
                  <label className="mt-2 cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                    Parcourir
                    <input type="file" multiple className="sr-only" onChange={handleFileInput} />
                  </label>
                  <p className="mt-2 text-[10px] text-slate-400">PDF, DOCX, XLSX, JPG — Max 10 MB par fichier</p>
                </div>

                {files.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {files.map((f) => (
                      <li key={f.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-700">{f.name}</p>
                          <p className="text-[10px] text-slate-400">{f.size}</p>
                        </div>
                        <button type="button" onClick={() => removeFile(f.id)}
                          className="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:text-rose-500 transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Countdown / eligibility */}
          {isExpired ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
                <AlertCircle className="h-5 w-5 text-rose-600" />
              </div>
              <p className="text-sm font-bold text-rose-800">Délai de recours expiré</p>
              <p className="mt-1 text-xs text-rose-700">
                La date limite était le {fmt(soumission.dateFinRecours)}. Il n&rsquo;est plus possible de déposer un recours pour cet AO.
              </p>
            </div>
          ) : (
            <div className={`rounded-xl border p-5 ${days <= 3 ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${days <= 3 ? "bg-amber-100" : "bg-emerald-100"}`}>
                <Clock className={`h-5 w-5 ${days <= 3 ? "text-amber-600" : "text-emerald-600"}`} />
              </div>
              <p className={`text-2xl font-black ${days <= 3 ? "text-amber-800" : "text-emerald-800"}`}>{days} <span className="text-base font-semibold">jour{days > 1 ? "s" : ""}</span></p>
              <p className={`text-xs font-semibold ${days <= 3 ? "text-amber-700" : "text-emerald-700"}`}>restant{days > 1 ? "s" : ""} pour déposer votre recours</p>
              <p className={`mt-2 text-[10px] ${days <= 3 ? "text-amber-600" : "text-emerald-600"}`}>
                Date limite : {fmt(soumission.dateFinRecours)}
              </p>
            </div>
          )}

          {/* Info légale */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">À noter</h3>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-start gap-1.5">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                Le recours doit être motivé et documenté
              </li>
              <li className="flex items-start gap-1.5">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                La commission dispose d&rsquo;un délai légal pour statuer
              </li>
              <li className="flex items-start gap-1.5">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                Vous serez notifié de la décision par la plateforme
              </li>
            </ul>
          </div>

          {/* Actions */}
          {!isExpired && (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!motif.trim()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: "#4CAF50" }}
              >
                <Send className="h-4 w-4" />
                Soumettre le recours
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}