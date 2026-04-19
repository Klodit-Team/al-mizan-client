"use client";

import { Landmark, ShieldCheck } from "lucide-react";
import { type CautionData } from "../wizard-types";
import { SectionTitle, NavButtons, FileDropzone, Field, Input } from "../wizard-ui";

const BANQUES_DZ = [
  "BNA - Banque Nationale d'Algérie",
  "CPA - Crédit Populaire d'Algérie",
  "BADR - Banque de l'Agriculture",
  "BDL - Banque de Développement Local",
  "BEA - Banque Extérieure d'Algérie",
  "CNEP - Caisse d'Épargne",
  "AGB - Arab Gulf Bank",
  "ABC - Arab Banking Corporation",
  "Société Générale Algérie",
  "BNP Paribas El Djazair",
  "Autre",
];

interface Props {
  caution: CautionData;
  onChange: (updated: CautionData) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function Step5CautionBancaire({ caution, onChange, onBack, onNext }: Props) {
  function set<K extends keyof CautionData>(key: K, value: CautionData[K]) {
    onChange({ ...caution, [key]: value });
  }

  const canProceed =
    !!caution.reference.trim() &&
    !!caution.banque.trim() &&
    !!caution.montant.trim() &&
    !!caution.emission &&
    !!caution.expiry &&
    !!caution.file;

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Caution de soumission"
        subtitle="Renseignez les informations de votre caution bancaire et joignez le document signé par votre banque."
      />

      {/* Info box */}
      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <Landmark className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
        <p className="text-[11px] text-slate-600">
          La caution de soumission garantit le sérieux de votre offre. Elle doit être émise par un
          établissement bancaire agréé par la Banque d&apos;Algérie et couvrir la période de validité des offres.
        </p>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Référence de la caution" required>
          <Input
            value={caution.reference}
            onChange={(v) => set("reference", v)}
            placeholder="Ex : CAU-2024-00892"
          />
        </Field>

        <Field label="Banque émettrice" required>
          <select
            value={caution.banque}
            onChange={(e) => set("banque", e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-[#4CAF50] transition-colors"
          >
            <option value="">Sélectionner une banque…</option>
            {BANQUES_DZ.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>

        <Field label="Montant de la caution (DZD)" required>
          <div className="relative">
            <Input
              value={caution.montant}
              onChange={(v) => set("montant", v)}
              placeholder="Ex : 1 000 000"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400">DZD</span>
          </div>
        </Field>

        <Field label="Date d'expiration" required>
          <input
            type="date"
            value={caution.expiry}
            onChange={(e) => set("expiry", e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-[#4CAF50] transition-colors"
          />
        </Field>

        <Field label="Date d'emission" required>
          <input
            type="date"
            value={caution.emission}
            onChange={(e) => set("emission", e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-[#4CAF50] transition-colors"
          />
        </Field>
      </div>

      {/* Filled summary */}
      {caution.reference && caution.banque && caution.montant && caution.emission && caution.expiry && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600">Récapitulatif caution</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11px]">
            <div><span className="text-slate-500">Référence :</span> <span className="font-semibold text-slate-700">{caution.reference}</span></div>
            <div><span className="text-slate-500">Banque :</span> <span className="font-semibold text-slate-700">{caution.banque}</span></div>
            <div><span className="text-slate-500">Montant :</span> <span className="font-semibold text-slate-700">{caution.montant} DZD</span></div>
            <div><span className="text-slate-500">Emission :</span> <span className="font-semibold text-slate-700">{new Date(caution.emission).toLocaleDateString("fr-DZ", { day: "numeric", month: "long", year: "numeric" })}</span></div>
            <div><span className="text-slate-500">Expiration :</span> <span className="font-semibold text-slate-700">{new Date(caution.expiry).toLocaleDateString("fr-DZ", { day: "numeric", month: "long", year: "numeric" })}</span></div>
          </div>
        </div>
      )}

      {/* Scan upload */}
      <div>
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500">
          Scan de la caution bancaire <span className="text-rose-500">*</span>
        </p>
        <FileDropzone
          label="Joindre le document de caution (PDF)"
          sublabel="Scan de la lettre de caution signée par la banque — PDF, max 10 Mo"
          file={caution.file}
          onFile={(f) => set("file", f)}
          accept=".pdf,.jpg,.png"
        />
      </div>

      {/* Security note */}
      <div className="flex items-center gap-2 text-[10px] text-slate-400">
        <ShieldCheck className="h-4 w-4 text-slate-300" />
        Le document de caution est transmis chiffré et sera vérifié lors de l&apos;ouverture des plis.
      </div>

      <NavButtons onBack={onBack} onNext={onNext} disabled={!canProceed} />
    </div>
  );
}