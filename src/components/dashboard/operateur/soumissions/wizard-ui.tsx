"use client";

import { CheckCircle2, ArrowLeft, ChevronRight, Send } from "lucide-react";
import { Search, ShieldCheck, ClipboardList, FileText, Landmark } from "lucide-react";

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { n: 1, label: "Sélection AO",          icon: <Search        className="h-3.5 w-3.5" /> },
  { n: 2, label: "Pièces admin",           icon: <ShieldCheck   className="h-3.5 w-3.5" /> },
  { n: 3, label: "Offre technique",         icon: <ClipboardList className="h-3.5 w-3.5" /> },
  { n: 4, label: "Offre financière",       icon: <FileText      className="h-3.5 w-3.5" /> },
  { n: 5, label: "Caution",                 icon: <Landmark      className="h-3.5 w-3.5" /> },
  { n: 6, label: "Récapitulatif",          icon: <Send          className="h-3.5 w-3.5" /> },
] as const;

export function StepIndicator({ step }: { step: 1 | 2 | 3 | 4 | 5 | 6 }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
            s.n === step
              ? "bg-[#4CAF50] text-white"
              : s.n < step
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-400"
          }`}>
            <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
              s.n === step ? "bg-white/25" : s.n < step ? "bg-emerald-200" : "bg-slate-200"
            }`}>
              {s.n < step ? <CheckCircle2 className="h-2.5 w-2.5" /> : s.n}
            </span>
            <span className="hidden md:inline">{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-px w-4 mx-0.5 ${s.n < step ? "bg-emerald-300" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Nav buttons ──────────────────────────────────────────────────────────────

export function NavButtons({
  onBack,
  onNext,
  nextLabel = "Continuer",
  nextIcon,
  disabled = false,
  isLast = false,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextIcon?: React.ReactNode;
  disabled?: boolean;
  isLast?: boolean;
}) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
      {onBack ? (
        <button type="button" onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />Retour
        </button>
      ) : <span />}
      <button
        type="button"
        disabled={disabled}
        onClick={onNext}
        className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 ${
          isLast ? "bg-[#2e7d32]" : ""
        }`}
        style={!isLast ? { backgroundColor: "#4CAF50" } : undefined}
      >
        {nextIcon ?? (isLast ? <Send className="h-4 w-4" /> : null)}
        {nextLabel}
        {!isLast && !nextIcon && <ChevronRight className="h-4 w-4" />}
      </button>
    </div>
  );
}

// ─── Section title ────────────────────────────────────────────────────────────

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-bold text-slate-800">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
}

// ─── File dropzone ────────────────────────────────────────────────────────────

import { Upload } from "lucide-react";

export function FileDropzone({
  label, sublabel, file, onFile, accept = ".pdf",
}: {
  label: string;
  sublabel?: string;
  file: File | null;
  onFile: (f: File) => void;
  accept?: string;
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
          <p className="text-[10px] text-slate-400">{sublabel ?? "PDF, max 20 Mo — Cliquer pour choisir"}</p>
        </>
      )}
      <input type="file" className="sr-only" accept={accept}
        onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files[0]); }} />
    </label>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

export function Field({
  label, required, children,
}: {
  label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}{required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export function Input({
  value, onChange, placeholder, type = "text",
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-[#4CAF50] transition-colors"
    />
  );
}