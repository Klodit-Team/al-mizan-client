"use client";

import { AlertCircle, CheckCircle2, ClipboardList, Landmark, Lock, Send } from "lucide-react";
import { type AoOption, type CautionData, type LotBpu } from "../wizard-types";
import { NavButtons, SectionTitle } from "../wizard-ui";

function parseMoney(value: string): number {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const parsed = Number(normalized);
  if (Number.isNaN(parsed)) {
    return 0;
  }
  return parsed;
}

function lotTotal(bpu: LotBpu): number {
  return bpu.lines.reduce((sum, line) => {
    const quantity = parseMoney(line.quantite);
    const unitPrice = parseMoney(line.prixUnitaire);
    return sum + (quantity * unitPrice);
  }, 0);
}

function fmtDzd(value: number): string {
  if (!value) {
    return "-";
  }

  return `${new Intl.NumberFormat("fr-DZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} DZD`;
}

interface Props {
  selectedAo: AoOption | null;
  selectedLotId: string;
  offreTechFile: File | null;
  lotBpus: LotBpu[];
  caution: CautionData;
  isSubmitting: boolean;
  submitError: string | null;
  onBack: () => void;
  onSubmit: () => void;
}

export default function Step5Review({
  selectedAo,
  selectedLotId,
  offreTechFile,
  lotBpus,
  caution,
  isSubmitting,
  submitError,
  onBack,
  onSubmit,
}: Props) {
  const selectedLot = selectedAo?.lots.find((lot) => lot.id === selectedLotId) || null;
  const selectedBpu = lotBpus.find((entry) => entry.lotId === selectedLotId) || null;
  const totalHt = selectedBpu ? lotTotal(selectedBpu) : 0;

  const canSubmit = Boolean(
    selectedAo
    && selectedLot
    && offreTechFile
    && selectedBpu
    && caution.file
    && caution.reference.trim()
    && caution.banque.trim()
    && caution.montant.trim()
    && caution.emission
    && caution.expiry,
  );

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Verification finale"
        subtitle="Controlez votre dossier. Au clic sur Deposer, le workflow service est execute: creation brouillon, upload technique, upload financiere chiffree, caution, puis validation."
      />

      {!canSubmit && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-xs text-amber-700">
            Le dossier est incomplet. Revenez aux etapes precedentes pour renseigner tous les champs obligatoires.
          </p>
        </div>
      )}

      {submitError && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
          <p className="text-xs text-rose-700">{submitError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Appel d'offres</p>
          <p className="text-xs font-semibold text-slate-800">{selectedAo?.reference || "-"}</p>
          <p className="mt-0.5 text-xs text-slate-600">{selectedAo?.object || "Objet non renseigne"}</p>
          <p className="mt-1 text-[11px] text-slate-500">{selectedAo?.organizationName || "-"}</p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Lot soumissionne</p>
          <p className="text-xs font-semibold text-slate-800">
            {selectedLot ? `Lot ${selectedLot.lotNumber} - ${selectedLot.designation}` : "-"}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">Total HT: <span className="font-semibold text-slate-700">{fmtDzd(totalHt)}</span></p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-slate-400" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Offre technique</p>
          </div>
          <p className="truncate text-xs font-semibold text-slate-700">{offreTechFile?.name || "Non fournie"}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {offreTechFile ? `${(offreTechFile.size / (1024 * 1024)).toFixed(2)} Mo` : "-"}
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <Landmark className="h-4 w-4 text-slate-400" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Caution bancaire</p>
          </div>
          <p className="text-xs text-slate-700">Ref: <span className="font-semibold">{caution.reference || "-"}</span></p>
          <p className="text-xs text-slate-700">Banque: <span className="font-semibold">{caution.banque || "-"}</span></p>
          <p className="text-xs text-slate-700">Montant: <span className="font-semibold">{caution.montant || "-"} DZD</span></p>
        </section>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
        <div className="flex items-start gap-2">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
          <div>
            <p className="text-xs font-semibold text-blue-700">Securite de l'offre financiere</p>
            <p className="mt-0.5 text-[11px] text-blue-700">
              Le frontend chiffre le fichier financier et signe le hash avant envoi, conformement au contrat du service soumission.
            </p>
          </div>
        </div>
      </div>

      {canSubmit && (
        <div className="flex items-center gap-2 text-xs text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Dossier complet et pret pour depot.
        </div>
      )}

      <NavButtons
        onBack={onBack}
        onNext={onSubmit}
        nextLabel={isSubmitting ? "Depot en cours..." : "Deposer la soumission"}
        nextIcon={<Send className="h-4 w-4" />}
        isLast
        disabled={!canSubmit || isSubmitting}
      />
    </div>
  );
}
