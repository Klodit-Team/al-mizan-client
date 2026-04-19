"use client";

import { FileText, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { fmtDate, type AdminDoc, type DocStatus } from "../wizard-types";
import { SectionTitle, NavButtons } from "../wizard-ui";

function docMeta(s: DocStatus) {
  switch (s) {
    case "conforme": return { label: "Conforme",  bg: "bg-emerald-100", text: "text-emerald-700", icon: <CheckCircle2 className="h-3.5 w-3.5" /> };
    case "expire":   return { label: "Expiré",   bg: "bg-rose-100",    text: "text-rose-700",    icon: <AlertCircle  className="h-3.5 w-3.5" /> };
    case "manquant": return { label: "Manquant",   bg: "bg-amber-100",   text: "text-amber-700",   icon: <AlertCircle  className="h-3.5 w-3.5" /> };
    case "uploade":  return { label: "Chargé",   bg: "bg-blue-100",    text: "text-blue-700",    icon: <CheckCircle2 className="h-3.5 w-3.5" /> };
  }
}

interface Props {
  docs: AdminDoc[];
  onUpload: (id: string, file: File) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function Step2AdminDocs({ docs, onUpload, onBack, onNext }: Props) {
  const blockers = docs.filter((d) => d.required && (d.status === "manquant" || d.status === "expire"));
  const canProceed = blockers.length === 0;

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Pièces administratives"
        subtitle="Téléversez et vérifiez les documents obligatoires pour votre dossier de soumission."
      />

      {blockers.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
          <p className="text-xs text-amber-700">
            <span className="font-semibold">{blockers.length} pièce{blockers.length > 1 ? "s" : ""} bloquante{blockers.length > 1 ? "s" : ""}</span>{" "}
            doi{blockers.length > 1 ? "vent" : "t"} être mises à jour avant de continuer.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {docs.map((doc) => {
          const meta = docMeta(doc.status);
          const blocking = doc.required && (doc.status === "manquant" || doc.status === "expire");
          return (
            <div key={doc.id} className={`flex items-center gap-3 rounded-xl border p-3 ${
              blocking ? "border-rose-200 bg-rose-50/40" : "border-slate-200 bg-white"
            }`}>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.bg}`}>
                <FileText className={`h-4 w-4 ${meta.text}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-slate-800">{doc.label}</p>
                  {doc.required && <span className="text-[9px] font-bold text-rose-500">*</span>}
                </div>
                {doc.fileName && <p className="truncate text-[10px] text-slate-500">{doc.fileName}</p>}
                {doc.expiry && (
                  <p className={`text-[10px] ${doc.status === "expire" ? "font-semibold text-rose-600" : "text-slate-400"}`}>
                    Expire le {fmtDate(doc.expiry)}
                  </p>
                )}
              </div>
              <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-px text-[10px] font-semibold ${meta.bg} ${meta.text}`}>
                {meta.icon}{meta.label}
              </span>
              <label className={`shrink-0 cursor-pointer inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                blocking ? "border-rose-300 text-rose-600 hover:bg-rose-50" : "border-slate-200 text-slate-600 hover:border-[#4CAF50] hover:text-[#4CAF50]"
              }`}>
                <Upload className="h-3 w-3" />
                {blocking ? "Téléverser" : "Remplacer"}
                <input type="file" className="sr-only" accept=".pdf,.jpg,.png"
                  onChange={(e) => { if (e.target.files?.[0]) onUpload(doc.id, e.target.files[0]); }} />
              </label>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-slate-400">
        <span className="text-rose-500">*</span> Pièces obligatoires. Formats acceptés&nbsp;: PDF, JPG, PNG (max 10 Mo).
      </p>

      <NavButtons onBack={onBack} onNext={onNext} disabled={!canProceed} />
    </div>
  );
}